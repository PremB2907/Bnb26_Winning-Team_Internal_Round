import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, questionId, learnerResponse, workingText, learnerCode, modality } = body;

    if (!sessionId || !questionId) {
      return NextResponse.json({ error: "Missing sessionId or questionId" }, { status: 400 });
    }

    const session = await prisma.learningSession.findUnique({
      where: { id: sessionId },
      include: { learner: true },
    });

    if (!session) {
      return NextResponse.json({ error: "LearningSession not found" }, { status: 444 });
    }

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // 1. Normalized output comparison (correct != resolved)
    const normActual = (learnerResponse || "").trim().toLowerCase();
    const normExpected = question.expectedAnswer.trim().toLowerCase();
    const isCorrect = normActual === normExpected;

    // 2. Persist Response row
    const responseRow = await prisma.response.create({
      data: {
        sessionId: session.id,
        learnerId: session.learnerId,
        questionId: question.id,
        content: learnerResponse || workingText || "No response",
        modality: modality || "TEXT",
        isCorrect: isCorrect,
        extractedReasoning: workingText || "",
      },
    });

    // 3. Call FastAPI ML Engine /diagnose
    let mlRes;
    try {
      mlRes = await fetch("http://127.0.0.1:8000/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: question.id,
          final_answer: learnerResponse || "",
          working_text: workingText || "",
          code: learnerCode || "",
        }),
      });
    } catch (err) {
      // Return 503 ML_UNAVAILABLE on connection failure - NO FABRICATED FALLBACK
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

    const diagData = await mlRes.json();
    const topLabel = diagData.predicted_label;
    const conf = diagData.confidence;
    const mId = topLabel === "CORRECT" || topLabel === "OTHER_UNKNOWN" ? null : topLabel;

    // Determine status (DIAGNOSED vs AMBIGUOUS)
    const isAmbiguous = conf < 0.40 || (diagData.classifier_probs && topLabel !== "CORRECT" && Object.values(diagData.classifier_probs as Record<string, number>).filter((v: number) => v > 0.2).length > 1);
    const diagStatus = isAmbiguous ? "AMBIGUOUS" : "DIAGNOSED";

    // 4. Persist Diagnosis row with candidate posterior JSON & engine trace
    const diagnosisRow = await prisma.diagnosis.create({
      data: {
        sessionId: session.id,
        misconceptionId: mId,
        status: diagStatus,
        confidence: conf,
        evidence: JSON.stringify(diagData.evidence_spans || []),
        missingEvidence: JSON.stringify(diagData.classifier_probs || {}),
      },
    });

    let probeRecommendation = null;
    let interventionRecommendation = null;

    // 5. Active Probe Selection if AMBIGUOUS
    if (isAmbiguous) {
      try {
        const probeRes = await fetch("http://127.0.0.1:8000/select-probe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            current_posterior: diagData.classifier_probs || {},
            excluded_question_ids: [question.id],
          }),
        });
        if (probeRes.ok) {
          probeRecommendation = await probeRes.json();
        }
      } catch (e) {
        console.warn("Probe selection failed:", e);
      }
    } else if (mId) {
      // 6. Grounded Intervention Recommendation if DIAGNOSED
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

      // Update MisconceptionHistory
      await prisma.misconceptionHistory.upsert({
        where: {
          learnerId_misconceptionId: {
            learnerId: session.learnerId,
            misconceptionId: mId,
          },
        },
        update: {
          occurrences: { increment: 1 },
          status: "PERSISTING",
          lastEncountered: new Date(),
        },
        create: {
          learnerId: session.learnerId,
          misconceptionId: mId,
          occurrences: 1,
          status: "PERSISTING",
        },
      });
    }

    // 7. Update MasteryRecord (Beta/BKT update from evidence)
    const existingMastery = await prisma.masteryRecord.findUnique({
      where: {
        learnerId_conceptId: {
          learnerId: session.learnerId,
          conceptId: question.conceptId,
        },
      },
    });

    const prevLevel = existingMastery ? existingMastery.masteryLevel : 0.5;
    const newLevel = isCorrect
      ? Math.min(1.0, prevLevel + 0.15 * (1.0 - prevLevel))
      : Math.max(0.0, prevLevel - 0.20 * prevLevel);

    await prisma.masteryRecord.upsert({
      where: {
        learnerId_conceptId: {
          learnerId: session.learnerId,
          conceptId: question.conceptId,
        },
      },
      update: {
        masteryLevel: newLevel,
        lastUpdated: new Date(),
      },
      create: {
        learnerId: session.learnerId,
        conceptId: question.conceptId,
        masteryLevel: newLevel,
      },
    });

    return NextResponse.json({
      status: "SUCCESS",
      sessionId: session.id,
      responseId: responseRow.id,
      diagnosis: diagnosisRow,
      probeRecommendation,
      interventionRecommendation,
      isCorrect,
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
