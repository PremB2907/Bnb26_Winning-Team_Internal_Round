import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, probeQuestionId, learnerAnswer } = body;

    if (!sessionId || !probeQuestionId) {
      return NextResponse.json({ error: "Missing sessionId or probeQuestionId" }, { status: 400 });
    }

    const session = await prisma.learningSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: "LearningSession not found" }, { status: 404 });
    }

    const question = await prisma.question.findUnique({ where: { id: probeQuestionId } });
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const isCorrect = (learnerAnswer || "").trim().toLowerCase() === question.expectedAnswer.trim().toLowerCase();

    // 1. Record Probe Response
    const responseRow = await prisma.response.create({
      data: {
        sessionId: session.id,
        learnerId: session.learnerId,
        questionId: question.id,
        content: learnerAnswer || "No response",
        modality: "TEXT",
        isCorrect,
        extractedReasoning: "Probe response",
      },
    });

    // 2. Fetch latest diagnosis for session to obtain current posterior
    const latestDiag = await prisma.diagnosis.findFirst({
      where: { sessionId: session.id },
      orderBy: { createdAt: "desc" },
    });

    let currentPosterior = {};
    if (latestDiag && latestDiag.missingEvidence) {
      try {
        currentPosterior = JSON.parse(latestDiag.missingEvidence);
      } catch (e) {
        currentPosterior = {};
      }
    }

    // 3. Call ML Engine /update-posterior
    let mlRes;
    try {
      mlRes = await fetch("http://127.0.0.1:8000/update-posterior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_posterior: currentPosterior,
          question_id: probeQuestionId,
          is_correct: isCorrect,
          learner_answer: learnerAnswer || "",
        }),
      });
    } catch (err) {
      return NextResponse.json(
        { status: "ML_UNAVAILABLE", reason: "ML Engine service at http://127.0.0.1:8000 is unavailable" },
        { status: 503 }
      );
    }

    if (!mlRes.ok) {
      return NextResponse.json(
        { status: "ML_UNAVAILABLE", reason: `ML Engine returned status ${mlRes.status}` },
        { status: 503 }
      );
    }

    const posteriorData = await mlRes.json();
    const topLabel = posteriorData.top_misconception;
    const conf = posteriorData.confidence;
    const isAmbiguous = conf < 0.40;
    const diagStatus = isAmbiguous ? "AMBIGUOUS" : "DIAGNOSED";
    const mId = topLabel === "CORRECT" || topLabel === "OTHER_UNKNOWN" ? null : topLabel;

    // 4. Record updated Diagnosis row
    const newDiagnosis = await prisma.diagnosis.create({
      data: {
        sessionId: session.id,
        misconceptionId: mId,
        status: diagStatus,
        confidence: conf,
        evidence: JSON.stringify(posteriorData.evidence || []),
        missingEvidence: JSON.stringify(posteriorData.updated_posterior || {}),
      },
    });

    let interventionRecommendation = null;
    if (!isAmbiguous && mId) {
      try {
        const intRes = await fetch("http://127.0.0.1:8000/recommend-intervention", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            misconception_id: mId,
            previous_interventions: [],
          }),
        });
        if (intRes.ok) {
          interventionRecommendation = await intRes.json();
          const template = await prisma.interventionTemplate.findFirst({
            where: { misconceptionId: mId },
          });
          if (template) {
            await prisma.intervention.create({
              data: {
                sessionId: session.id,
                templateId: template.id,
              },
            });
          }
        }
      } catch (e) {
        console.warn("Intervention recommendation failed:", e);
      }
    }

    return NextResponse.json({
      status: "SUCCESS",
      sessionId: session.id,
      responseId: responseRow.id,
      diagnosis: newDiagnosis,
      updatedPosterior: posteriorData.updated_posterior,
      interventionRecommendation,
    });
  } catch (error: any) {
    console.error("Probe Answer Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
