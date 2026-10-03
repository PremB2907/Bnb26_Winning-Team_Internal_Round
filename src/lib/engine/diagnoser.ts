import { PrismaClient } from '@prisma/client';
import { LLMAnalyzer } from './SemanticAnalyzer';

const prisma = new PrismaClient();
const analyzer = new LLMAnalyzer();

export type DiagnosisStatus = 'DIAGNOSED' | 'AMBIGUOUS' | 'NOVEL_OR_UNCERTAIN';

export interface DiagnosisCandidate {
  misconceptionId: string;
  score: number;
  evidence: string[];
  missingEvidence: string[];
  confidence: number;
}

export interface EngineDiagnosisResult {
  status: DiagnosisStatus;
  candidates: DiagnosisCandidate[];
  trace: string[];
  selectedMisconceptionId?: string;
  discriminatingQuestion?: any;
}

export class DiagnoserEngine {
  
  async analyzeResponse(
    questionId: string,
    learnerResponse: string,
    learnerId: string
  ): Promise<EngineDiagnosisResult> {
    const trace: string[] = ['Response received'];
    
    // Fetch question and concept
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { concept: { include: { misconceptions: true } } }
    });

    if (!question) throw new Error("Question not found");
    trace.push(`Concept identified: ${question.concept.name}`);

    // Check correctness (exact match for demo, but SemanticAnalyzer handles reasoning in real app)
    if (learnerResponse.trim().toLowerCase() === question.expectedAnswer.toLowerCase()) {
      trace.push('Response classified as correct');
      return { status: 'DIAGNOSED', candidates: [], trace };
    }

    trace.push('Response classified as incorrect');

    // Prepare candidates for semantic analysis
    const candidateData = question.concept.misconceptions.map(m => ({
      id: m.id,
      triggers: JSON.parse(m.triggerPatterns)
    }));

    // Semantic analysis
    trace.push('Running semantic analysis on reasoning');
    const analysis = await analyzer.analyze(question.content, question.expectedAnswer, learnerResponse, candidateData);

    const candidates: DiagnosisCandidate[] = analysis.matchedMisconceptionIds.map(mId => ({
      misconceptionId: mId,
      score: analysis.confidence,
      evidence: [analysis.reasoning],
      missingEvidence: [],
      confidence: analysis.confidence
    }));

    // Differentiation logic
    if (candidates.length === 0) {
      trace.push('No candidates matched. Marking as NOVEL_OR_UNCERTAIN');
      return { status: 'NOVEL_OR_UNCERTAIN', candidates, trace };
    }

    if (candidates.length > 1 || candidates[0].confidence < 0.8) {
      trace.push('Multiple candidates or low confidence. Marking as AMBIGUOUS to ask discriminating question');
      
      // Find a discriminating question
      const discQuestions = await prisma.question.findMany({
        where: {
          conceptId: question.concept.id,
          isDiscriminatingFor: { not: null }
        }
      });
      
      const discQuestion = discQuestions.find(q => {
        const triggers = JSON.parse(q.isDiscriminatingFor || '[]');
        return candidates.some(c => triggers.includes(c.misconceptionId));
      });

      return {
        status: 'AMBIGUOUS',
        candidates,
        trace,
        discriminatingQuestion: discQuestion
      };
    }

    trace.push(`Targeted misconception selected: ${candidates[0].misconceptionId}`);
    return {
      status: 'DIAGNOSED',
      candidates,
      selectedMisconceptionId: candidates[0].misconceptionId,
      trace
    };
  }
}

export const diagnoser = new DiagnoserEngine();
