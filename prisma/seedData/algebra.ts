export const algebraConcepts = [
  { id: 'c_alg_1', name: 'Linear Equations', description: 'Solving linear equations and algebraic expressions.' },
  { id: 'c_alg_2', name: 'Fractions & Ratios', description: 'Operations involving rational numbers.' },
  { id: 'c_alg_3', name: 'Exponents & Roots', description: 'Rules of exponents and radical operations.' },
  { id: 'c_alg_4', name: 'Inequalities', description: 'Solving and graphing inequalities.' }
];

export const algebraMisconceptions = [
  // Linear Equations
  {
    id: 'm_alg_1', conceptId: 'c_alg_1',
    name: 'Sign Distribution Error',
    description: 'Failing to distribute a negative sign to all terms inside parentheses.',
    correctReasoning: 'A negative sign applies to every term inside the parentheses.',
    incorrectReasoningPatterns: '["-(x+2) is -x+2", "Only negate the first term"]',
    triggerPatterns: '["3 - (x + 4) = -x - 1 instead of -x - 7"]',
    severity: 'HIGH',
    questions: [
      { id: 'q_alg_1', type: 'TEXT', content: 'Simplify: 5 - (2x + 3)', expectedAnswer: '-2x + 2', isDiscriminatingFor: null },
      { id: 'dq_alg_1', type: 'TEXT', content: 'What is -1 multiplied by +3?', expectedAnswer: '-3', isDiscriminatingFor: '["m_alg_1"]' },
      { id: 'vq_alg_1', type: 'TEXT', content: 'Simplify: 10 - (x - 4)', expectedAnswer: '-x + 14', isVerificationFor: 'm_alg_1' }
    ],
    interventions: [{ type: 'visual', content: 'Think of -(2x + 3) as -1 * (2x + 3). Distribute the -1 to BOTH the 2x and the 3.' }]
  },
  {
    id: 'm_alg_2', conceptId: 'c_alg_1',
    name: 'Inverse Operation Confusion',
    description: 'Applying the wrong inverse operation, such as subtracting instead of dividing.',
    correctReasoning: 'Use division to undo multiplication, and subtraction to undo addition.',
    incorrectReasoningPatterns: '["2x = 10 so x = 8", "Moved 2 over by subtracting"]',
    triggerPatterns: '["2x = 10 => x = 8"]',
    severity: 'HIGH',
    questions: [
      { id: 'q_alg_2', type: 'TEXT', content: 'Solve for x: 3x = 12', expectedAnswer: 'x = 4', isDiscriminatingFor: null },
      { id: 'dq_alg_2', type: 'TEXT', content: 'Is 3x representing 3 plus x, or 3 times x?', expectedAnswer: '3 times x', isDiscriminatingFor: '["m_alg_2"]' },
      { id: 'vq_alg_2', type: 'TEXT', content: 'Solve for y: 5y = 20', expectedAnswer: 'y = 4', isVerificationFor: 'm_alg_2' }
    ],
    interventions: [{ type: 'micro-explanation', content: 'When a number is right next to a variable (like 3x), they are multiplying. To undo multiplication, you must divide, not subtract.' }]
  },
  {
    id: 'm_alg_3', conceptId: 'c_alg_1',
    name: 'Equality Misconception',
    description: 'Treating the equals sign as a "calculate the answer" command rather than a statement of equivalence.',
    correctReasoning: 'An equation balances two equal sides.',
    incorrectReasoningPatterns: '["It just means write the answer", "Can\'t have variables on both sides"]',
    triggerPatterns: '["8 = 2x + 4 is confusing"]',
    severity: 'MEDIUM',
    questions: [
      { id: 'q_alg_3', type: 'TEXT', content: 'True or False: The equation 10 = 2x + 4 is mathematically valid.', expectedAnswer: 'True', isDiscriminatingFor: null },
      { id: 'dq_alg_3', type: 'TEXT', content: 'Does the side the variable is on matter for an equation?', expectedAnswer: 'No', isDiscriminatingFor: '["m_alg_3"]' },
      { id: 'vq_alg_3', type: 'TEXT', content: 'Solve: 15 = 3x', expectedAnswer: '5', isVerificationFor: 'm_alg_3' }
    ],
    interventions: [{ type: 'analogy', content: 'An equals sign is like a balanced scale. As long as both sides weigh the same, it doesn\'t matter which side the heavy weight is on.' }]
  },
  {
    id: 'm_alg_4', conceptId: 'c_alg_1',
    name: 'Variable Cancellation',
    description: 'Incorrectly cancelling variables across addition or subtraction in rational expressions.',
    correctReasoning: 'You can only cancel factors (multiplication), not terms (addition/subtraction).',
    incorrectReasoningPatterns: '["(x + 2)/x = 2", "Cancelled the x terms"]',
    triggerPatterns: '["(x+4)/x = 4"]',
    severity: 'HIGH',
    questions: [
      { id: 'q_alg_4', type: 'TEXT', content: 'Simplify (x + 5) / x', expectedAnswer: '(x + 5) / x', isDiscriminatingFor: null },
      { id: 'dq_alg_4', type: 'TEXT', content: 'If x is 5, does (5 + 5)/5 equal 5?', expectedAnswer: 'No, it equals 2', isDiscriminatingFor: '["m_alg_4"]' },
      { id: 'vq_alg_4', type: 'TEXT', content: 'Can (y^2 + y) / y be simplified to y^2?', expectedAnswer: 'No (it simplifies to y+1)', isVerificationFor: 'm_alg_4' }
    ],
    interventions: [{ type: 'worked-example', content: 'Test with numbers! If x=5, (5+5)/5 is 10/5 = 2. If you just cancelled the x, you would get 5. This proves you cannot cancel terms separated by addition.' }]
  },

  // Fractions & Ratios
  {
    id: 'm_alg_5', conceptId: 'c_alg_2',
    name: 'Fraction Addition Misconception',
    description: 'Adding fractions by adding numerators and denominators straight across.',
    correctReasoning: 'Fractions require a common denominator before adding numerators.',
    incorrectReasoningPatterns: '["1/2 + 1/3 = 2/5", "Just add top and bottom"]',
    triggerPatterns: '["1/2 + 1/3 = 2/5"]',
    severity: 'HIGH',
    questions: [
      { id: 'q_alg_5', type: 'TEXT', content: 'Calculate 1/2 + 1/4', expectedAnswer: '3/4', isDiscriminatingFor: null },
      { id: 'dq_alg_5', type: 'TEXT', content: 'If you have half a pizza and a quarter of a pizza, do you have 2/6 of a pizza?', expectedAnswer: 'No', isDiscriminatingFor: '["m_alg_5"]' },
      { id: 'vq_alg_5', type: 'TEXT', content: 'Calculate 1/3 + 1/6', expectedAnswer: '1/2', isVerificationFor: 'm_alg_5' }
    ],
    interventions: [{ type: 'visual', content: 'Think of pieces of a pie. You can\'t easily add a "third" piece and a "half" piece without first cutting them into equal-sized smaller slices (common denominators).' }]
  },
  {
    id: 'm_alg_6', conceptId: 'c_alg_2',
    name: 'Cross-Multiplication Misapplication',
    description: 'Using cross-multiplication for fraction addition or multiplication instead of proportions.',
    correctReasoning: 'Cross-multiplication is only used when an equals sign separates two fractions (proportions).',
    incorrectReasoningPatterns: '["1/2 * 3/4 = 4/6", "Crossed them to multiply"]',
    triggerPatterns: '["1/2 * 3/4"]',
    severity: 'MEDIUM',
    questions: [
      { id: 'q_alg_6', type: 'TEXT', content: 'Multiply: 2/3 * 4/5', expectedAnswer: '8/15', isDiscriminatingFor: null },
      { id: 'dq_alg_6', type: 'TEXT', content: 'Do you need common denominators to multiply fractions?', expectedAnswer: 'No', isDiscriminatingFor: '["m_alg_6"]' },
      { id: 'vq_alg_6', type: 'TEXT', content: 'Multiply: 3/4 * 1/2', expectedAnswer: '3/8', isVerificationFor: 'm_alg_6' }
    ],
    interventions: [{ type: 'micro-explanation', content: 'When MULTIPLYING fractions, just shoot straight across: top times top, bottom times bottom.' }]
  },

  // Exponents & Roots
  {
    id: 'm_alg_7', conceptId: 'c_alg_3',
    name: 'Exponent Multiplication Confusion',
    description: 'Multiplying the base by the exponent instead of raising to the power.',
    correctReasoning: 'An exponent dictates how many times the base is multiplied by itself.',
    incorrectReasoningPatterns: '["3^2 = 6", "Multiply base by exponent"]',
    triggerPatterns: '["x^2 = 2x"]',
    severity: 'HIGH',
    questions: [
      { id: 'q_alg_7', type: 'TEXT', content: 'What is 4^3?', expectedAnswer: '64', isDiscriminatingFor: null },
      { id: 'dq_alg_7', type: 'TEXT', content: 'Does 4^3 mean 4 times 3, or 4 times 4 times 4?', expectedAnswer: '4 times 4 times 4', isDiscriminatingFor: '["m_alg_7"]' },
      { id: 'vq_alg_7', type: 'TEXT', content: 'What is 5^2?', expectedAnswer: '25', isVerificationFor: 'm_alg_7' }
    ],
    interventions: [{ type: 'worked-example', content: '4^3 means four, three times: 4 * 4 * 4. 4*4 is 16. 16*4 is 64.' }]
  },
  {
    id: 'm_alg_8', conceptId: 'c_alg_3',
    name: 'Negative Exponent Misinterpretation',
    description: 'Believing a negative exponent makes the number negative.',
    correctReasoning: 'A negative exponent indicates taking the reciprocal of the base.',
    incorrectReasoningPatterns: '["2^-3 = -8", "Negative exponent makes negative answer"]',
    triggerPatterns: '["3^-2 = -9"]',
    severity: 'HIGH',
    questions: [
      { id: 'q_alg_8', type: 'TEXT', content: 'Evaluate: 2^-3', expectedAnswer: '1/8', isDiscriminatingFor: null },
      { id: 'dq_alg_8', type: 'TEXT', content: 'Does a negative sign in the exponent change the sign of the whole number?', expectedAnswer: 'No', isDiscriminatingFor: '["m_alg_8"]' },
      { id: 'vq_alg_8', type: 'TEXT', content: 'Evaluate: 4^-2', expectedAnswer: '1/16', isVerificationFor: 'm_alg_8' }
    ],
    interventions: [{ type: 'micro-explanation', content: 'A negative exponent means "divide instead of multiply", so it flips the number over the fraction line: x^-y = 1/(x^y).' }]
  },
  {
    id: 'm_alg_9', conceptId: 'c_alg_3',
    name: 'Exponent Addition Rule Error',
    description: 'Adding bases instead of multiplying them, or adding exponents when adding bases.',
    correctReasoning: 'When multiplying same bases, add exponents (x^a * x^b = x^(a+b)).',
    incorrectReasoningPatterns: '["x^2 + x^3 = x^5", "Add exponents when adding"]',
    triggerPatterns: '["x^2 + x^3 = x^5"]',
    severity: 'MEDIUM',
    questions: [
      { id: 'q_alg_9', type: 'TEXT', content: 'Simplify: x^2 * x^4', expectedAnswer: 'x^6', isDiscriminatingFor: null },
      { id: 'dq_alg_9', type: 'TEXT', content: 'If you have (x*x) multiplied by (x*x*x*x), how many x\'s are you multiplying in total?', expectedAnswer: '6', isDiscriminatingFor: '["m_alg_9"]' },
      { id: 'vq_alg_9', type: 'TEXT', content: 'Simplify: y^3 * y^5', expectedAnswer: 'y^8', isVerificationFor: 'm_alg_9' }
    ],
    interventions: [{ type: 'micro-explanation', content: 'When MULTIPLYING variables with the same base, you ADD the exponents.' }]
  },
  {
    id: 'm_alg_10', conceptId: 'c_alg_3',
    name: 'Square Root of Addition Misconception',
    description: 'Incorrectly distributing a square root over addition: sqrt(a^2 + b^2) = a + b.',
    correctReasoning: 'Square roots do not distribute over addition or subtraction.',
    incorrectReasoningPatterns: '["sqrt(9+16) = 3+4=7", "distribute root"]',
    triggerPatterns: '["sqrt(a^2 + b^2) = a + b"]',
    severity: 'HIGH',
    questions: [
      { id: 'q_alg_10', type: 'TEXT', content: 'Evaluate: sqrt(9 + 16)', expectedAnswer: '5', isDiscriminatingFor: null },
      { id: 'dq_alg_10', type: 'TEXT', content: 'What is 9 + 16?', expectedAnswer: '25', isDiscriminatingFor: '["m_alg_10"]' },
      { id: 'vq_alg_10', type: 'TEXT', content: 'Evaluate: sqrt(36 + 64)', expectedAnswer: '10', isVerificationFor: 'm_alg_10' }
    ],
    interventions: [{ type: 'counterexample', content: 'If sqrt(9+16) was sqrt(9)+sqrt(16), the answer would be 3+4=7. But 9+16=25, and sqrt(25) is 5. They are not equal!' }]
  },

  // Inequalities
  {
    id: 'm_alg_11', conceptId: 'c_alg_4',
    name: 'Inequality Direction Misunderstanding',
    description: 'Failing to flip the inequality sign when multiplying/dividing by a negative number.',
    correctReasoning: 'Multiplying or dividing both sides by a negative number flips the direction of the inequality.',
    incorrectReasoningPatterns: '["-2x > 4 so x > -2", "Forgot to flip"]',
    triggerPatterns: '["-2x > 4 => x > -2"]',
    severity: 'HIGH',
    questions: [
      { id: 'q_alg_11', type: 'TEXT', content: 'Solve: -3x < 12', expectedAnswer: 'x > -4', isDiscriminatingFor: null },
      { id: 'dq_alg_11', type: 'TEXT', content: 'If you divide an inequality by a negative number, what happens to the sign?', expectedAnswer: 'It flips', isDiscriminatingFor: '["m_alg_11"]' },
      { id: 'vq_alg_11', type: 'TEXT', content: 'Solve: -5y >= 20', expectedAnswer: 'y <= -4', isVerificationFor: 'm_alg_11' }
    ],
    interventions: [{ type: 'worked-example', content: 'Think about numbers: -3 is less than 5 (-3 < 5). If we multiply both sides by -1, we get 3 and -5. But 3 is GREATER than -5. So the sign must flip: 3 > -5.' }]
  },
  
  // Mixed / Fundamentals
  {
    id: 'm_alg_12', conceptId: 'c_alg_1',
    name: 'Order of Operations Misconception',
    description: 'Evaluating expressions purely left-to-right ignoring precedence.',
    correctReasoning: 'Multiplication/Division before Addition/Subtraction.',
    incorrectReasoningPatterns: '["2+3*4 = 20"]',
    triggerPatterns: '["2+3*4 = 20"]',
    severity: 'HIGH',
    questions: [
      { id: 'q_alg_12', type: 'TEXT', content: 'Calculate 5 + 2 * 3', expectedAnswer: '11', isDiscriminatingFor: null },
      { id: 'dq_alg_12', type: 'TEXT', content: 'What operation happens first in 5 + 2 * 3?', expectedAnswer: '2 * 3', isDiscriminatingFor: '["m_alg_12"]' },
      { id: 'vq_alg_12', type: 'TEXT', content: 'Calculate 10 - 4 / 2', expectedAnswer: '8', isVerificationFor: 'm_alg_12' }
    ],
    interventions: [{ type: 'hint', content: 'Remember PEMDAS: Multiplication comes before Addition.' }]
  },
  {
    id: 'm_alg_13', conceptId: 'c_alg_1',
    name: 'Substitution Misconception',
    description: 'Substituting a value without using parentheses, leading to wrong sign operations.',
    correctReasoning: 'Always wrap substituted negative values in parentheses.',
    incorrectReasoningPatterns: '["x=-2, x^2 = -4", "Forgot parens"]',
    triggerPatterns: '["-2^2 = -4 instead of 4"]',
    severity: 'MEDIUM',
    questions: [
      { id: 'q_alg_13', type: 'TEXT', content: 'If x = -3, what is x^2?', expectedAnswer: '9', isDiscriminatingFor: null },
      { id: 'dq_alg_13', type: 'TEXT', content: 'What is (-3) * (-3)?', expectedAnswer: '9', isDiscriminatingFor: '["m_alg_13"]' },
      { id: 'vq_alg_13', type: 'TEXT', content: 'If y = -5, evaluate y^2', expectedAnswer: '25', isVerificationFor: 'm_alg_13' }
    ],
    interventions: [{ type: 'micro-explanation', content: 'When substituting a negative number for a variable raised to a power, you are squaring the ENTIRE number, including its sign. (-3)^2 means (-3) * (-3) = 9.' }]
  },
  {
    id: 'm_alg_14', conceptId: 'c_alg_2',
    name: 'Proportional Reasoning Error',
    description: 'Using additive differences instead of multiplicative factors in proportions.',
    correctReasoning: 'Proportions rely on multiplication/ratios, not additive differences.',
    incorrectReasoningPatterns: '["2/3 = 3/4 because added 1 to both"]',
    triggerPatterns: '["Added same amount to numerator and denominator"]',
    severity: 'MEDIUM',
    questions: [
      { id: 'q_alg_14', type: 'TEXT', content: 'If a recipe for 2 people takes 4 eggs, how many eggs for 3 people?', expectedAnswer: '6', isDiscriminatingFor: null },
      { id: 'dq_alg_14', type: 'TEXT', content: 'Did the number of people increase by a factor, or just by adding 1?', expectedAnswer: 'It multiplied by 1.5', isDiscriminatingFor: '["m_alg_14"]' },
      { id: 'vq_alg_14', type: 'TEXT', content: 'If 4 tickets cost $20, how much do 6 tickets cost?', expectedAnswer: '30', isVerificationFor: 'm_alg_14' }
    ],
    interventions: [{ type: 'worked-example', content: 'Find the cost per 1 item first. 4 eggs for 2 people means 2 eggs per person. So 3 people need 3 * 2 = 6 eggs.' }]
  },
  {
    id: 'm_alg_15', conceptId: 'c_alg_1',
    name: 'Polynomial Degree Misunderstanding',
    description: 'Believing the degree of a polynomial is the number of terms, not the highest exponent.',
    correctReasoning: 'Degree is the highest exponent of the variable in the expression.',
    incorrectReasoningPatterns: '["3 terms means degree 3", "Ignored highest power"]',
    triggerPatterns: '["x^4 + x + 1 is degree 3"]',
    severity: 'LOW',
    questions: [
      { id: 'q_alg_15', type: 'TEXT', content: 'What is the degree of x^5 + 2x^2 + 1?', expectedAnswer: '5', isDiscriminatingFor: null },
      { id: 'dq_alg_15', type: 'TEXT', content: 'Is degree based on the number of terms, or the highest power?', expectedAnswer: 'Highest power', isDiscriminatingFor: '["m_alg_15"]' },
      { id: 'vq_alg_15', type: 'TEXT', content: 'What is the degree of 4x^3 + 9x^6?', expectedAnswer: '6', isVerificationFor: 'm_alg_15' }
    ],
    interventions: [{ type: 'micro-explanation', content: 'The degree is simply the highest exponent found on any variable in the polynomial.' }]
  }
];
