export interface AnalysisResult {
  reasoning: string;
  matchedMisconceptionIds: string[];
  confidence: number;
}

export abstract class SemanticAnalyzer {
  abstract analyze(
    questionContent: string,
    expectedAnswer: string,
    learnerResponse: string,
    candidateMisconceptions: { id: string, triggers: string[] }[]
  ): Promise<AnalysisResult>;
}

export class DeterministicAnalyzer extends SemanticAnalyzer {
  async analyze(
    questionContent: string,
    expectedAnswer: string,
    learnerResponse: string,
    candidateMisconceptions: { id: string, triggers: string[] }[]
  ): Promise<AnalysisResult> {
    const normalizedResponse = learnerResponse.trim().toLowerCase();
    const matched = [];

    // Simple deterministic fallback: check for substring matches of triggers
    for (const m of candidateMisconceptions) {
      for (const trigger of m.triggers) {
        if (normalizedResponse.includes(trigger.toLowerCase())) {
          matched.push(m.id);
        }
      }
    }

    if (matched.length > 0) {
      return {
        reasoning: 'Deterministic trigger matched based on known patterns.',
        matchedMisconceptionIds: matched,
        confidence: matched.length === 1 ? 0.9 : 0.4 // lower confidence if multiple match
      };
    }

    return {
      reasoning: 'No known triggers matched.',
      matchedMisconceptionIds: [],
      confidence: 0.1
    };
  }
}

export class LLMAnalyzer extends SemanticAnalyzer {
  // In a real implementation, this calls OpenAI or Anthropic API.
  async analyze(
    questionContent: string,
    expectedAnswer: string,
    learnerResponse: string,
    candidateMisconceptions: { id: string, triggers: string[] }[]
  ): Promise<AnalysisResult> {
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      // Graceful fallback if no API key
      const fallback = new DeterministicAnalyzer();
      return fallback.analyze(questionContent, expectedAnswer, learnerResponse, candidateMisconceptions);
    }

    // Mocking an LLM call for the hackathon demo since we don't have keys in this environment
    return new DeterministicAnalyzer().analyze(questionContent, expectedAnswer, learnerResponse, candidateMisconceptions);
  }
}
