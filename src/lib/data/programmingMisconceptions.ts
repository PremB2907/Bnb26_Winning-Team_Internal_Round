import { Misconception, Concept, Question } from '../types';

export const programmingConcepts: Concept[] = [
  {
    id: 'PROG_C01',
    domain: 'programming',
    name: 'Boolean Logic',
    description: 'Understanding truth values, conditionals, and boolean operators.'
  },
  {
    id: 'PROG_C02',
    domain: 'programming',
    name: 'Variables and Assignment',
    description: 'Storing data, variable scope, and mutation.'
  }
];

export const programmingMisconceptions: Misconception[] = [
  {
    id: 'PROG_M01',
    domain: 'programming',
    conceptId: 'PROG_C01',
    name: 'Condition Inversion',
    description: 'Learner interprets a condition as its exact opposite (e.g., treating x > 5 as x < 5).',
    common_patterns: ['Selecting the else branch when condition is true', 'Evaluating > as <'],
    trigger_examples: ['if (x > 5)'],
    correct_reasoning: 'The statement evaluates whether x is strictly greater than 5.',
    incorrect_reasoning: ['If x is 10, then x > 5 is false because 10 is not greater than 5.'],
    diagnostic_questions: [
      {
        id: 'Q_PROG_M01_01',
        conceptId: 'PROG_C01',
        type: 'code',
        content: `What is the output?
x = 10
if x > 5:
    print("A")
else:
    print("B")`,
        expected_answer: 'A'
      }
    ],
    interventions: [
      {
        id: 'I_PROG_M01_01',
        type: 'micro-explanation',
        content: 'Let us read the condition out loud: "Is x greater than 5?". Since x is 10, the answer is Yes (True). Therefore, the program runs the first block, not the else block.'
      }
    ],
    verification_questions: [
      {
        id: 'VQ_PROG_M01_01',
        conceptId: 'PROG_C01',
        type: 'code',
        content: `What is the output?
age = 18
if age < 21:
    print("Minor")
else:
    print("Adult")`,
        expected_answer: 'Minor'
      }
    ]
  },
  {
    id: 'PROG_M02',
    domain: 'programming',
    conceptId: 'PROG_C02',
    name: 'Assignment vs Equality',
    description: 'Learner confuses assignment (=) with equality check (==).',
    common_patterns: ['Using = in if statements', 'Saying "x becomes 5" when seeing x == 5'],
    trigger_examples: ['if (x = 5)'],
    correct_reasoning: '= assigns a value, == checks if values are equal.',
    incorrect_reasoning: ['The condition sets x to 5 and then returns true.'],
    diagnostic_questions: [],
    interventions: [
      {
        id: 'I_PROG_M02_01',
        type: 'analogy',
        content: 'Think of `=` as a command ("Put this in the box") and `==` as a question ("Are these the same?").'
      }
    ],
    verification_questions: []
  }
];
