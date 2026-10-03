import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, verificationQuestionId, learnerAnswer } = body;

    if (!sessionId || !verificationQuestionId) {
      return NextResponse.json(
        { error: "Missing sessionId or verificationQuestionId" },
        { status: 400 }
      );
    }

    const session = await prisma.learningSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: "LearningSession not found" }, { status: 404 });
    }

    const question = await prisma.question.findUnique({ where: { id: verificationQuestionId } });
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // 1. Evaluate verification answer
    const normActual = (learnerAnswer || "").trim().toLowerCase();
    const normExpected = question.expectedAnswer.trim().toLowerCase();
    const isCorrect = normActual === normExpected;

    // Fetch latest diagnosis for session to know which misconception was being treated
    const latestDiag = await prisma.diagnosis.findFirst({
      where: { sessionId: session.id },
      orderBy: { createdAt: "desc" },
    });

    const mId = latestDiag?.misconceptionId || null;

    // Determine resolution status based on verification outcome (Correctness != Resolution)
    // Dynamic BKT policy: transfer question correct -> RESOLVED, else PERSISTING
    const resolutionStatus = isCorrect ? "RESOLVED" : "PERSISTING";
    const confidence = latestDiag ? latestDiag.confidence : 0.85;

    // 2. Create VerificationAttempt row
    const verificationRow = await prisma.verificationAttempt.create({
      data: {
        sessionId: session.id,
        questionId: question.id,
        isCorrect,
        resolutionStatus,
        confidence,
      },
    });

    // 3. Update MisconceptionHistory status if misconception identified
    if (mId) {
      await prisma.misconceptionHistory.upsert({
        where: {
          learnerId_misconceptionId: {
            learnerId: session.learnerId,
            misconceptionId: mId,
          },
        },
        update: {
          status: resolutionStatus,
          lastEncountered: new Date(),
        },
        create: {
          learnerId: session.learnerId,
          misconceptionId: mId,
          occurrences: 1,
          status: resolutionStatus,
        },
      });
    }

    // 4. Update MasteryRecord
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
      ? Math.min(1.0, prevLevel + 0.25 * (1.0 - prevLevel))
      : Math.max(0.0, prevLevel - 0.15 * prevLevel);

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
      verification: verificationRow,
      resolutionStatus,
      isCorrect,
    });
  } catch (error: any) {
    console.error("Verify Answer Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
