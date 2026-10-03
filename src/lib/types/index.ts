export type Domain = 'programming' | 'algebra' | 'physics';

export type Modality = 'text' | 'code' | 'mcq' | 'image';

export interface Concept {
  id: string;
  domain: Domain;
  name: string;
  description: string;
  parentConceptId?: string;
}

export interface Misconception {
  id: string;
  domain: Domain;
  conceptId: string;
  name: string;
  description: string;
  common_patterns: string[];
  trigger_examples: string[];
  correct_reasoning: string;
  incorrect_reasoning: string[];
  diagnostic_questions: Question[];
  interventions: InterventionTemplate[];
  verification_questions: Question[];
}

export interface Question {
  id: string;
  conceptId: string;
  type: Modality;
  content: string; // The question text / code
  options?: { id: string; text: string }[]; // For MCQ
  expected_answer: string;
  expected_reasoning?: string;
}

export interface InterventionTemplate {
  id: string;
  type: 'micro-explanation' | 'worked-example' | 'counterexample' | 'visual' | 'analogy' | 'hint' | 'socratic' | 'code-trace' | 'practice';
  content: string;
}

export interface DiagnosisResult {
  diagnosis: string;
  misconception_id: string | null;
  confidence: number; // 0.0 to 1.0
  evidence: string[];
  alternative_explanations: string[];
  severity: 'low' | 'medium' | 'high';
  recommended_intervention_type: InterventionTemplate['type'];
  status: 'diagnosed' | 'needs_discrimination';
}

export interface LearnerState {
  learner_id: string;
  mastery_by_concept: Record<string, number>;
  active_misconceptions: {
    id: string;
    confidence: number;
    occurrences: number;
    status: 'PERSISTING' | 'PARTIALLY_RESOLVED' | 'RESOLVED' | 'UNCERTAIN';
  }[];
  history: LearningSession[];
}

export interface LearningSession {
  id: string;
  timestamp: string;
  question_id: string;
  learner_response: string;
  diagnosis?: DiagnosisResult;
  intervention_applied?: InterventionTemplate;
  verification_result?: 'RESOLVED' | 'PERSISTING' | 'UNCERTAIN';
}
