import { DiagnosisResult, LearnerState, Modality, Question, Misconception } from '../types';
import { programmingMisconceptions } from '../data/programmingMisconceptions';

export class DiagnoserEngine {
  
  // A mock deterministic method for demo purposes.
  // In a real scenario, this would call an LLM with semantic reasoning if rules fail.
  async analyzeResponse(
    question: Question,
    learnerResponse: string,
    learnerState: LearnerState
  ): Promise<DiagnosisResult> {
    
    // Check for correct answer
    if (learnerResponse.trim().toLowerCase() === question.expected_answer.toLowerCase()) {
      return {
        diagnosis: "Answer is correct. No misconception detected.",
        misconception_id: null,
        confidence: 1.0,
        evidence: ["Learner provided the exact expected answer."],
        alternative_explanations: [],
        severity: "low",
        recommended_intervention_type: "practice",
        status: "diagnosed"
      };
    }

    // Demo deterministic rule matching based on question and response
    if (question.id === 'Q_PROG_M01_01' && learnerResponse.trim().toUpperCase() === 'B') {
      const misconception = programmingMisconceptions.find(m => m.id === 'PROG_M01');
      
      return {
        diagnosis: "Learner is incorrectly interpreting the condition as x < 5.",
        misconception_id: misconception?.id || null,
        confidence: 0.94,
        evidence: [
          "The learner selected the branch opposite to the evaluated condition.",
          "Condition was x > 5 and x was 10, meaning it is true, but learner output 'B' which is the false branch."
        ],
        alternative_explanations: [
          "Learner might not understand indentation rules (unlikely in this context)",
          "Learner might have misread the value of x as being less than 5"
        ],
        severity: "high",
        recommended_intervention_type: "micro-explanation",
        status: "diagnosed"
      };
    }

    // Generic fallback for unknown errors
    return {
      diagnosis: "Incorrect answer due to undetermined error.",
      misconception_id: null,
      confidence: 0.4,
      evidence: ["Answer did not match expected, and did not match known misconception signatures."],
      alternative_explanations: ["Calculation error", "Careless mistake"],
      severity: "medium",
      recommended_intervention_type: "hint",
      status: "needs_discrimination"
    };
  }

  generateIntervention(misconceptionId: string) {
    const misconception = programmingMisconceptions.find(m => m.id === misconceptionId);
    if (!misconception || misconception.interventions.length === 0) return null;
    return misconception.interventions[0]; // pick first for simplicity
  }
}

export const diagnoser = new DiagnoserEngine();
