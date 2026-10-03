import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { questionId, learnerResponse, workingText, code, modality } = body;

    // 1. Get or create demo User & LearnerProfile
    let user = await prisma.user.findFirst({ where: { email: "learner@relearn.edu" } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: "learner@relearn.edu", name: "Alice Learner" },
      });
    }

    let profile = await prisma.learnerProfile.findFirst({ where: { userId: user.id } });
    if (!profile) {
      profile = await prisma.learnerProfile.create({ data: { userId: user.id } });
    }

    // 2. Fetch Question
    const question = await prisma.question.findUnique({ where: { id: questionId || "q_alias_1" } });
    const targetQId = question ? question.id : "q_alias_1";

    // 3. Create LearningSession
    const session = await prisma.learningSession.create({
      data: {
        learnerId: profile.id,
        questionId: targetQId,
      },
    });

    // 4. Create Response row
    const isCorrect = question ? question.expectedAnswer.trim() === (learnerResponse || "").trim() : false;
    const responseRow = await prisma.response.create({
      data: {
        sessionId: session.id,
        learnerId: profile.id,
        questionId: targetQId,
        content: learnerResponse || workingText || "No response",
        modality: modality || "TEXT",
        isCorrect: isCorrect,
        extractedReasoning: workingText || "",
      },
    });

    // 5. Call Python ML Engine FastAPI service /diagnose
    let diagnosisResult = {
      predicted_label: "M_ALIAS_COPY",
      confidence: 0.85,
      evidence_spans: [workingText || learnerResponse || ""],
    };

    try {
      const mlRes = await fetch("http://127.0.0.1:8000/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: targetQId,
          final_answer: learnerResponse || "",
          working_text: workingText || "",
          code: code || "",
        }),
      });
      if (mlRes.ok) {
        diagnosisResult = await mlRes.json();
      }
    } catch (e) {
      console.warn("ML Engine offline, using local fallback diagnosis");
    }

    const mId = diagnosisResult.predicted_label === "CORRECT" || diagnosisResult.predicted_label === "OTHER_UNKNOWN"
      ? null
      : diagnosisResult.predicted_label;

    // 6. Create Diagnosis row
    const diagnosisRow = await prisma.diagnosis.create({
      data: {
        sessionId: session.id,
        misconceptionId: mId,
        status: diagnosisResult.confidence < 0.4 ? "AMBIGUOUS" : "DIAGNOSED",
        confidence: diagnosisResult.confidence,
        evidence: JSON.stringify(diagnosisResult.evidence_spans || []),
      },
    });

    // 7. Write/Update MisconceptionHistory row if diagnosed
    if (mId) {
      await prisma.misconceptionHistory.upsert({
        where: {
          learnerId_misconceptionId: {
            learnerId: profile.id,
            misconceptionId: mId,
          },
        },
        update: {
          occurrences: { increment: 1 },
          status: "PERSISTING",
          lastEncountered: new Date(),
        },
        create: {
          learnerId: profile.id,
          misconceptionId: mId,
          occurrences: 1,
          status: "PERSISTING",
        },
      });

      // 8. Create Intervention & InterventionTemplate link if present
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

    // 9. Write/Update MasteryRecord
    if (question) {
      await prisma.masteryRecord.upsert({
        where: {
          learnerId_conceptId: {
            learnerId: profile.id,
            conceptId: question.conceptId,
          },
        },
        update: {
          masteryLevel: isCorrect ? 0.8 : 0.4,
          lastUpdated: new Date(),
        },
        create: {
          learnerId: profile.id,
          conceptId: question.conceptId,
          masteryLevel: isCorrect ? 0.8 : 0.4,
        },
      });
    }

    // 10. Create VerificationAttempt row
    const verificationRow = await prisma.verificationAttempt.create({
      data: {
        sessionId: session.id,
        questionId: targetQId,
        isCorrect: isCorrect,
        resolutionStatus: isCorrect ? "PARTIALLY_RESOLVED" : "PERSISTING",
        confidence: diagnosisResult.confidence,
        evidence: JSON.stringify(diagnosisResult.evidence_spans || []),
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      responseId: responseRow.id,
      diagnosis: diagnosisRow,
      verification: verificationRow,
      mId,
    });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
