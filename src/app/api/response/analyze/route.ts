import { NextResponse } from 'next/server';
import { diagnoser } from '@/lib/engine/diagnoser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { questionId, response, learnerId } = body;

    if (!questionId || !response) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Run Engine
    const result = await diagnoser.analyzeResponse(questionId, response, learnerId || 'demo-user');

    // Create session & record response
    const session = await prisma.learningSession.create({
      data: {
        learnerId: learnerId || 'profile-1',
        questionId: questionId
      }
    });

    await prisma.response.create({
      data: {
        sessionId: session.id,
        learnerId: learnerId || 'profile-1',
        questionId: questionId,
        content: response,
        modality: 'TEXT',
        isCorrect: result.status === 'DIAGNOSED' && result.candidates.length === 0
      }
    });

    let intervention = null;
    let verificationQuestion = null;
    let misconceptionData = null;

    if (result.selectedMisconceptionId) {
      const misconception = await prisma.misconception.findUnique({
        where: { id: result.selectedMisconceptionId },
        include: { interventions: true }
      });

      if (misconception) {
        misconceptionData = misconception;
        intervention = misconception.interventions[0] || null;

        const vqList = await prisma.question.findMany({
          where: { isVerificationFor: result.selectedMisconceptionId }
        });
        verificationQuestion = vqList[0] || null;
      }
    }

    return NextResponse.json({
      result,
      misconception: misconceptionData,
      intervention,
      verificationQuestion,
      discriminatingQuestion: result.discriminatingQuestion
    });
  } catch (error: any) {
    console.error('Error analyzing response:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
