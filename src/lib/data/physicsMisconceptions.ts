import { Misconception, Concept } from '../types';

export const physicsConcepts: Concept[] = [
  {
    id: 'PHY_C01',
    domain: 'physics',
    name: 'Kinematics',
    description: 'Motion, velocity, and acceleration.'
  }
];

export const physicsMisconceptions: Misconception[] = [
  {
    id: 'PHY_M01',
    domain: 'physics',
    conceptId: 'PHY_C01',
    name: 'Acceleration interpreted as Speed',
    description: 'Learner believes that if an object has zero acceleration, it must be stationary.',
    common_patterns: ['a = 0 implies v = 0'],
    trigger_examples: ['Object moving at constant velocity'],
    correct_reasoning: 'Zero acceleration means velocity is constant, not necessarily zero.',
    incorrect_reasoning: ['If it is not accelerating, it is not moving.'],
    diagnostic_questions: [
      {
        id: 'Q_PHY_M01_01',
        conceptId: 'PHY_C01',
        type: 'mcq',
        content: 'A car is traveling on a straight highway at a constant 60 mph. What is its acceleration?',
        expected_answer: '0'
      }
    ],
    interventions: [
      {
        id: 'I_PHY_M01_01',
        type: 'micro-explanation',
        content: 'Acceleration is the RATE OF CHANGE of velocity. If you are cruising at exactly 60 mph without pressing the gas or brake, your speed is not changing. Therefore, acceleration is 0, even though you are moving very fast.'
      }
    ],
    verification_questions: [
      {
        id: 'VQ_PHY_M01_01',
        conceptId: 'PHY_C01',
        type: 'text',
        content: 'An asteroid floats through deep space at a constant 500 m/s. What is its acceleration?',
        expected_answer: '0'
      }
    ]
  }
];
