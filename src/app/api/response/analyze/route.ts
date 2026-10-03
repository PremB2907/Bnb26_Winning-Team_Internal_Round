import { NextResponse } from 'next/server';
import { diagnoser } from '@/lib/engine/diagnoser';
import { Question, LearnerState } from '@/lib/types';
import { programmingMisconceptions } from '@/lib/data/programmingMisconceptions';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { questionId, response, learnerId } = body;

    if (!questionId || !response) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Mock DB fetch for question
    const question: Question = programmingMisconceptions
      .flatMap(m => m.diagnostic_questions)
      .find(q => q.id === questionId) || {
        id: questionId,
        conceptId: 'UNKNOWN',
        type: 'text',
        content: 'Unknown question',
        expected_answer: 'Unknown'
      };

    // Mock Learner State
    const mockState: LearnerState = {
      learner_id: learnerId || 'demo-user',
      mastery_by_concept: {},
      active_misconceptions: [],
      history: []
    };

    const diagnosis = await diagnoser.analyzeResponse(question, response, mockState);

    let intervention = null;
    let verificationQuestion = null;

    if (diagnosis.misconception_id) {
      intervention = diagnoser.generateIntervention(diagnosis.misconception_id);
      
      const misconception = programmingMisconceptions.find(m => m.id === diagnosis.misconception_id);
      if (misconception && misconception.verification_questions.length > 0) {
        verificationQuestion = misconception.verification_questions[0];
      }
    }

    return NextResponse.json({
      diagnosis,
      intervention,
      verificationQuestion
    });
  } catch (error) {
    console.error('Error analyzing response:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
