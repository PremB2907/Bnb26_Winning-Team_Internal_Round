import { Misconception, Concept } from '../types';

export const algebraConcepts: Concept[] = [
  {
    id: 'ALG_C01',
    domain: 'algebra',
    name: 'Linear Equations',
    description: 'Solving linear equations and inverse operations.'
  }
];

export const algebraMisconceptions: Misconception[] = [
  {
    id: 'ALG_M01',
    domain: 'algebra',
    conceptId: 'ALG_C01',
    name: 'Sign Distribution Error',
    description: 'Learner forgets to distribute the negative sign to all terms inside parentheses.',
    common_patterns: ['-(x + 2) becomes -x + 2'],
    trigger_examples: ['-(x + 2)'],
    correct_reasoning: 'The negative sign applies to every term inside the parentheses.',
    incorrect_reasoning: ['I only applied the negative to the first term.'],
    diagnostic_questions: [
      {
        id: 'Q_ALG_M01_01',
        conceptId: 'ALG_C01',
        type: 'mcq',
        content: 'Simplify: 3 - (x + 4)',
        expected_answer: '-x - 1'
      }
    ],
    interventions: [
      {
        id: 'I_ALG_M01_01',
        type: 'visual',
        content: 'Think of -(x + 4) as -1 * (x + 4). When you distribute -1, you get -1*x + -1*4, which is -x - 4.'
      }
    ],
    verification_questions: [
      {
        id: 'VQ_ALG_M01_01',
        conceptId: 'ALG_C01',
        type: 'text',
        content: 'Simplify: 5 - (2x - 3)',
        expected_answer: '-2x + 8'
      }
    ]
  }
];
