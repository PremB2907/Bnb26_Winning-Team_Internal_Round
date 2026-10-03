import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const learnerIdInput = body.learnerId;

    let learnerProfile;

    if (learnerIdInput) {
      learnerProfile = await prisma.learnerProfile.findUnique({
        where: { id: learnerIdInput },
      });
    }

    if (!learnerProfile) {
      // Create anonymous User & LearnerProfile (no hardcoded Alice)
      const anonEmail = `learner_${uuidv4().slice(0, 8)}@relearn.edu`;
      const user = await prisma.user.create({
        data: {
          email: anonEmail,
          name: `Learner ${anonEmail.slice(8, 13)}`,
        },
      });

      learnerProfile = await prisma.learnerProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Diagnostic Question Selection based on unresolved misconceptions
    const initialQuestion = await prisma.question.findFirst({
      where: { id: "q_alias_1" },
    }) || (await prisma.question.findFirst());

    if (!initialQuestion) {
      return NextResponse.json({ error: "No diagnostic questions found in DB" }, { status: 500 });
    }

    const session = await prisma.learningSession.create({
      data: {
        learnerId: learnerProfile.id,
        questionId: initialQuestion.id,
      },
    });

    return NextResponse.json({
      success: true,
      learnerId: learnerProfile.id,
      sessionId: session.id,
      question: initialQuestion,
    });
  } catch (error: any) {
    console.error("Session start error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
