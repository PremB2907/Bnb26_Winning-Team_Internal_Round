export const physicsConcepts = [
  { id: 'c_phy_1', name: 'Kinematics', description: 'Motion, velocity, and acceleration.' },
  { id: 'c_phy_2', name: 'Dynamics', description: 'Forces, mass, and Newton’s laws.' },
  { id: 'c_phy_3', name: 'Energy & Work', description: 'Conservation of energy, kinetic, potential.' },
  { id: 'c_phy_4', name: 'Electricity', description: 'Circuits, current, and voltage.' }
];

export const physicsMisconceptions = [
  // Kinematics
  {
    id: 'm_phy_1', conceptId: 'c_phy_1',
    name: 'Acceleration interpreted as Speed',
    description: 'Believing that if an object has zero acceleration, it must be stationary.',
    correctReasoning: 'Zero acceleration means velocity is constant, not necessarily zero.',
    incorrectReasoningPatterns: '["a=0 means stopped", "It isn\'t accelerating so it\'s not moving"]',
    triggerPatterns: '["Car moving at 60mph has high acceleration"]',
    severity: 'HIGH',
    questions: [
      { id: 'q_phy_1', type: 'TEXT', content: 'A car travels on a straight highway at a constant 60 mph. What is its acceleration?', expectedAnswer: '0', isDiscriminatingFor: null },
      { id: 'dq_phy_1', type: 'TEXT', content: 'Does acceleration measure how fast you are going, or how fast your speed is changing?', expectedAnswer: 'How fast speed is changing', isDiscriminatingFor: '["m_phy_1"]' },
      { id: 'vq_phy_1', type: 'TEXT', content: 'A spaceship glides through deep space at a constant 1000 m/s. What is its acceleration?', expectedAnswer: '0', isVerificationFor: 'm_phy_1' }
    ],
    interventions: [{ type: 'analogy', content: 'Acceleration is the feeling of being pushed back in your seat when you step on the gas. If you are cruising at a steady speed, you don\'t feel that push. The acceleration is zero.' }]
  },
  {
    id: 'm_phy_2', conceptId: 'c_phy_1',
    name: 'Distance vs Displacement',
    description: 'Failing to distinguish between total path length (distance) and net position change (displacement).',
    correctReasoning: 'Displacement is a vector tracking straight-line change in position; distance is a scalar tracking total path.',
    incorrectReasoningPatterns: '["Ran 400m around track, displacement is 400m"]',
    triggerPatterns: '["Returned to start = high displacement"]',
    severity: 'MEDIUM',
    questions: [
      { id: 'q_phy_2', type: 'TEXT', content: 'You walk 10m forward, then 10m back to where you started. What is your displacement?', expectedAnswer: '0', isDiscriminatingFor: null },
      { id: 'dq_phy_2', type: 'TEXT', content: 'Did your final position change from your starting position?', expectedAnswer: 'No', isDiscriminatingFor: '["m_phy_2"]' },
      { id: 'vq_phy_2', type: 'TEXT', content: 'A swimmer completes one full 50m lap (down and back in a 25m pool). What is their displacement?', expectedAnswer: '0', isVerificationFor: 'm_phy_2' }
    ],
    interventions: [{ type: 'micro-explanation', content: 'Distance is your step counter. Displacement is measuring the straight-line distance from where you started to where you ended.' }]
  },

  // Dynamics
  {
    id: 'm_phy_3', conceptId: 'c_phy_2',
    name: 'Mass vs Weight',
    description: 'Treating mass (amount of matter) and weight (force of gravity) as the exact same concept.',
    correctReasoning: 'Mass is constant everywhere; weight changes based on local gravity (W = mg).',
    incorrectReasoningPatterns: '["Mass is less on the moon", "They are the same thing"]',
    triggerPatterns: '["Mass on moon is 1/6th"]',
    severity: 'HIGH',
    questions: [
      { id: 'q_phy_3', type: 'TEXT', content: 'If an astronaut travels to the Moon, what happens to their mass?', expectedAnswer: 'Stays the same', isDiscriminatingFor: null },
      { id: 'dq_phy_3', type: 'TEXT', content: 'Is mass the amount of matter inside you, or how hard a planet pulls on you?', expectedAnswer: 'Amount of matter', isDiscriminatingFor: '["m_phy_3"]' },
      { id: 'vq_phy_3', type: 'TEXT', content: 'If a 10kg block is moved to Mars, what is its mass?', expectedAnswer: '10kg', isVerificationFor: 'm_phy_3' }
    ],
    interventions: [{ type: 'analogy', content: 'Mass is how many atoms you are made of. Weight is how hard a planet is pulling on those atoms. You don\'t lose atoms by going to the moon, you just lose the strong pull!' }]
  },
  {
    id: 'm_phy_4', conceptId: 'c_phy_2',
    name: 'Force vs Motion Misconception',
    description: 'Believing a constant force is required to maintain constant velocity.',
    correctReasoning: 'Newton\'s First Law: an object in motion stays in motion unless acted on by an unbalanced force. No net force is needed to maintain constant velocity.',
    incorrectReasoningPatterns: '["If it\'s moving, there must be a force", "Force pushes it forward constantly"]',
    triggerPatterns: '["Constant force needed for constant speed"]',
    severity: 'HIGH',
    questions: [
      { id: 'q_phy_4', type: 'TEXT', content: 'A hockey puck slides frictionlessly on ice at a constant speed. What is the net horizontal force on it?', expectedAnswer: '0', isDiscriminatingFor: null },
      { id: 'dq_phy_4', type: 'TEXT', content: 'If there was a net force pushing it forward, what would happen to its speed?', expectedAnswer: 'It would accelerate/speed up', isDiscriminatingFor: '["m_phy_4"]' },
      { id: 'vq_phy_4', type: 'TEXT', content: 'A probe drifts through deep space at a constant 5000 m/s with engines off. What is the net force?', expectedAnswer: '0', isVerificationFor: 'm_phy_4' }
    ],
    interventions: [{ type: 'micro-explanation', content: 'You only need a force to overcome friction. If there is no friction, an object will coast forever without any push. Net force causes ACCELERATION, not just motion.' }]
  },
  {
    id: 'm_phy_5', conceptId: 'c_phy_2',
    name: 'Newton\'s Third Law Misconception',
    description: 'Believing that a larger or heavier object exerts a greater force on a smaller object during a collision.',
    correctReasoning: 'Forces in an action-reaction pair are always exactly equal and opposite.',
    incorrectReasoningPatterns: '["Truck hits car, truck exerts more force", "Bigger mass means bigger force push"]',
    triggerPatterns: '["Truck pushes harder on car"]',
    severity: 'HIGH',
    questions: [
      { id: 'q_phy_5', type: 'TEXT', content: 'A semi-truck collides with a small car. Which exerts a greater force on the other?', expectedAnswer: 'They exert equal force', isDiscriminatingFor: null },
      { id: 'dq_phy_5', type: 'TEXT', content: 'Does Newton\'s Third Law depend on the size of the objects?', expectedAnswer: 'No, every action has an equal/opposite reaction.', isDiscriminatingFor: '["m_phy_5"]' },
      { id: 'vq_phy_5', type: 'TEXT', content: 'A bowling ball hits a pin. Which exerts a greater force on the other?', expectedAnswer: 'Equal force', isVerificationFor: 'm_phy_5' }
    ],
    interventions: [{ type: 'worked-example', content: 'They exert the exact same force on each other! The small car experiences more ACCELERATION (damage/bounce) because it has less mass (F = ma), but the force applied was identical.' }]
  },
  {
    id: 'm_phy_6', conceptId: 'c_phy_2',
    name: 'Normal Force equals Gravity',
    description: 'Assuming the normal force is always equal to weight (mg) regardless of angle or external forces.',
    correctReasoning: 'Normal force is the perpendicular contact force; it changes on inclines or if other vertical forces act.',
    incorrectReasoningPatterns: '["N = mg always", "Normal force is gravity"]',
    triggerPatterns: '["Block on ramp, N = mg"]',
    severity: 'MEDIUM',
    questions: [
      { id: 'q_phy_6', type: 'TEXT', content: 'A 10kg block sits on a ramp angled at 30 degrees. Is the normal force equal to its full weight?', expectedAnswer: 'No', isDiscriminatingFor: null },
      { id: 'dq_phy_6', type: 'TEXT', content: 'Does the ramp push back with the full weight of the block if the block is tilted?', expectedAnswer: 'No, only the perpendicular component.', isDiscriminatingFor: '["m_phy_6"]' },
      { id: 'vq_phy_6', type: 'TEXT', content: 'You push down on a book resting on a table. Is the normal force greater than, less than, or equal to the book\'s weight?', expectedAnswer: 'Greater than', isVerificationFor: 'm_phy_6' }
    ],
    interventions: [{ type: 'visual', content: 'Normal force just provides exactly enough push to keep an object from falling through a surface. If the surface is slanted, it doesn\'t need to push as hard against gravity.' }]
  },
  {
    id: 'm_phy_7', conceptId: 'c_phy_2',
    name: 'Friction Direction Misconception',
    description: 'Believing friction always points opposite to the direction of motion.',
    correctReasoning: 'Static friction can point in the direction of intended motion (e.g., walking, driving) to prevent slipping.',
    incorrectReasoningPatterns: '["Friction always opposes motion", "Car moves forward, friction points back"]',
    triggerPatterns: '["Friction opposes motion"]',
    severity: 'MEDIUM',
    questions: [
      { id: 'q_phy_7', type: 'TEXT', content: 'When a car accelerates forward, which direction does the friction from the road push the tires?', expectedAnswer: 'Forward', isDiscriminatingFor: null },
      { id: 'dq_phy_7', type: 'TEXT', content: 'If there was no friction (ice), which way would the tire spin?', expectedAnswer: 'Backward', isDiscriminatingFor: '["m_phy_7"]' },
      { id: 'vq_phy_7', type: 'TEXT', content: 'When you walk forward, which way does static friction on your shoes point?', expectedAnswer: 'Forward', isVerificationFor: 'm_phy_7' }
    ],
    interventions: [{ type: 'micro-explanation', content: 'The tire wants to spin backward against the pavement. Static friction opposes THAT slip, pushing the tire (and the car) FORWARD.' }]
  },

  // Energy & Work
  {
    id: 'm_phy_8', conceptId: 'c_phy_3',
    name: 'Work vs Exertion Misconception',
    description: 'Believing that holding a heavy object stationary requires physics "work" because it makes you tired.',
    correctReasoning: 'Work = Force x Distance. If distance is zero, work is zero.',
    incorrectReasoningPatterns: '["Holding a 100lb weight is hard work", "Sweating means work done"]',
    triggerPatterns: '["Holding object stationary = doing work"]',
    severity: 'HIGH',
    questions: [
      { id: 'q_phy_8', type: 'TEXT', content: 'You hold a 50kg barbell over your head perfectly still for 10 minutes. How much work have you done on the barbell?', expectedAnswer: '0', isDiscriminatingFor: null },
      { id: 'dq_phy_8', type: 'TEXT', content: 'Did the barbell move any distance?', expectedAnswer: 'No', isDiscriminatingFor: '["m_phy_8"]' },
      { id: 'vq_phy_8', type: 'TEXT', content: 'You push against a brick wall with all your strength, but it doesn\'t move. How much work did you do on the wall?', expectedAnswer: '0', isVerificationFor: 'm_phy_8' }
    ],
    interventions: [{ type: 'hint', content: 'In physics, Work requires MOVEMENT. Your muscles use biological energy, but they transfer zero energy to the object if it doesn\'t move.' }]
  },
  {
    id: 'm_phy_9', conceptId: 'c_phy_3',
    name: 'Kinetic Energy Linearity',
    description: 'Believing that doubling speed doubles kinetic energy.',
    correctReasoning: 'Kinetic Energy depends on velocity squared (KE = 1/2 mv^2). Doubling speed quadruples energy.',
    incorrectReasoningPatterns: '["Twice as fast means twice the energy", "Proportional"]',
    triggerPatterns: '["Double speed = double energy"]',
    severity: 'MEDIUM',
    questions: [
      { id: 'q_phy_9', type: 'TEXT', content: 'If a car goes twice as fast, how much does its kinetic energy increase by?', expectedAnswer: '4 times', isDiscriminatingFor: null },
      { id: 'dq_phy_9', type: 'TEXT', content: 'What is the formula for kinetic energy?', expectedAnswer: '1/2 mv^2', isDiscriminatingFor: '["m_phy_9"]' },
      { id: 'vq_phy_9', type: 'TEXT', content: 'If you triple your speed, by what factor does your kinetic energy increase?', expectedAnswer: '9 times', isVerificationFor: 'm_phy_9' }
    ],
    interventions: [{ type: 'micro-explanation', content: 'Velocity is SQUARED in the kinetic energy equation. If you double v, (2v)^2 becomes 4v^2. The energy quadruples.' }]
  },
  {
    id: 'm_phy_10', conceptId: 'c_phy_3',
    name: 'Potential Energy absolute zero',
    description: 'Believing potential energy has an absolute physical zero, rather than being relative to a chosen reference point.',
    correctReasoning: 'Potential energy is relative; only changes in PE matter.',
    incorrectReasoningPatterns: '["PE is zero at the ground always", "Absolute zero PE"]',
    triggerPatterns: '["PE is absolute"]',
    severity: 'LOW',
    questions: [
      { id: 'q_phy_10', type: 'TEXT', content: 'True or False: A book on a table has exactly zero gravitational potential energy if we choose the table as our height reference.', expectedAnswer: 'True', isDiscriminatingFor: null },
      { id: 'dq_phy_10', type: 'TEXT', content: 'Can we define h=0 wherever we want?', expectedAnswer: 'Yes', isDiscriminatingFor: '["m_phy_10"]' },
      { id: 'vq_phy_10', type: 'TEXT', content: 'If we define the ceiling as h=0, will a book on the floor have negative potential energy?', expectedAnswer: 'Yes', isVerificationFor: 'm_phy_10' }
    ],
    interventions: [{ type: 'analogy', content: 'Potential energy is like altitude. You can measure altitude relative to sea level, or relative to the ground you are standing on. You get to pick the zero point.' }]
  },

  // Electricity
  {
    id: 'm_phy_11', conceptId: 'c_phy_4',
    name: 'Current consumption',
    description: 'Believing that current is "used up" by components like resistors or bulbs in a series circuit.',
    correctReasoning: 'Current is conserved in a series circuit. Energy (voltage) is dropped, but the flow of electrons is the same everywhere.',
    incorrectReasoningPatterns: '["Less current after the bulb", "Bulb uses up current"]',
    triggerPatterns: '["Current is less returning to battery"]',
    severity: 'HIGH',
    questions: [
      { id: 'q_phy_11', type: 'TEXT', content: 'In a series circuit with a battery and a bulb, is the current leaving the bulb less than the current entering it?', expectedAnswer: 'No, it is the same', isDiscriminatingFor: null },
      { id: 'dq_phy_11', type: 'TEXT', content: 'Does a lightbulb destroy electrons?', expectedAnswer: 'No', isDiscriminatingFor: '["m_phy_11"]' },
      { id: 'vq_phy_11', type: 'TEXT', content: 'In a series circuit with two resistors, is the current between them less than the current leaving the battery?', expectedAnswer: 'No, it is the same', isVerificationFor: 'm_phy_11' }
    ],
    interventions: [{ type: 'analogy', content: 'Current is like water flowing through a pipe. A water wheel (bulb) takes energy from the water, but the exact same AMOUNT of water flows out the other side.' }]
  },
  {
    id: 'm_phy_12', conceptId: 'c_phy_4',
    name: 'Voltage vs Current confusion',
    description: 'Using the terms voltage and current interchangeably.',
    correctReasoning: 'Voltage is the push (potential difference), current is the flow (rate of charge).',
    incorrectReasoningPatterns: '["Voltage flows through the wire", "Current pushes the electrons"]',
    triggerPatterns: '["Voltage flows"]',
    severity: 'HIGH',
    questions: [
      { id: 'q_phy_12', type: 'TEXT', content: 'True or False: Voltage flows through a wire.', expectedAnswer: 'False', isDiscriminatingFor: null },
      { id: 'dq_phy_12', type: 'TEXT', content: 'What actually flows: the push, or the electrons?', expectedAnswer: 'The electrons', isDiscriminatingFor: '["m_phy_12"]' },
      { id: 'vq_phy_12', type: 'TEXT', content: 'Which term describes the pressure pushing the electricity: Voltage or Current?', expectedAnswer: 'Voltage', isVerificationFor: 'm_phy_12' }
    ],
    interventions: [{ type: 'micro-explanation', content: 'Current FLOWS. Voltage PUSHES. Voltage is placed ACROSS a component to push the current THROUGH it.' }]
  },
  {
    id: 'm_phy_13', conceptId: 'c_phy_4',
    name: 'Short Circuit Misconception',
    description: 'Believing electricity will ONLY take the path of least resistance.',
    correctReasoning: 'Electricity takes ALL paths, inversely proportional to their resistance.',
    incorrectReasoningPatterns: '["All current goes through the easy path", "No current in higher resistance"]',
    triggerPatterns: '["All current ignores the resistor"]',
    severity: 'MEDIUM',
    questions: [
      { id: 'q_phy_13', type: 'TEXT', content: 'If a circuit splits into a 1-ohm path and a 100-ohm path, will all the current go down the 1-ohm path?', expectedAnswer: 'No', isDiscriminatingFor: null },
      { id: 'dq_phy_13', type: 'TEXT', content: 'Does a 100-ohm path still allow SOME flow?', expectedAnswer: 'Yes', isDiscriminatingFor: '["m_phy_13"]' },
      { id: 'vq_phy_13', type: 'TEXT', content: 'If a highway has 4 lanes open, and a parallel dirt road has 1 lane, do zero cars take the dirt road?', expectedAnswer: 'No, some still take it', isVerificationFor: 'm_phy_13' }
    ],
    interventions: [{ type: 'micro-explanation', content: 'Electricity doesn\'t completely ignore a path just because it\'s harder. It splits up! Most goes down the easy path, but a little still trickles down the hard path.' }]
  },
  
  // Mixed
  {
    id: 'm_phy_14', conceptId: 'c_phy_2',
    name: 'Gravity causes all downward force',
    description: 'Believing an object moving downward must have gravity as the ONLY force acting on it.',
    correctReasoning: 'Other forces (air resistance, tension) can act, gravity is just the primary downward force.',
    incorrectReasoningPatterns: '["Only gravity pulls down", "Falling means only gravity"]',
    triggerPatterns: '["Falling leaf only has gravity"]',
    severity: 'LOW',
    questions: [
      { id: 'q_phy_14', type: 'TEXT', content: 'When a parachute falls at a constant terminal velocity, is gravity the only force acting on it?', expectedAnswer: 'No (air resistance)', isDiscriminatingFor: null },
      { id: 'dq_phy_14', type: 'TEXT', content: 'If only gravity acted on it, would it fall at a constant speed?', expectedAnswer: 'No, it would accelerate', isDiscriminatingFor: '["m_phy_14"]' },
      { id: 'vq_phy_14', type: 'TEXT', content: 'A feather floats slowly to the ground. Is gravity the only vertical force?', expectedAnswer: 'No', isVerificationFor: 'm_phy_14' }
    ],
    interventions: [{ type: 'hint', content: 'Remember that fluids (like air) push back against moving objects!' }]
  },
  {
    id: 'm_phy_15', conceptId: 'c_phy_1',
    name: 'Velocity implies position',
    description: 'Confusing a high velocity with being in front.',
    correctReasoning: 'An object can be moving much faster but still be behind another object.',
    incorrectReasoningPatterns: '["Car A is faster so it must be ahead", "Higher speed means winning"]',
    triggerPatterns: '["Faster object is leading"]',
    severity: 'LOW',
    questions: [
      { id: 'q_phy_15', type: 'TEXT', content: 'Car A is moving at 100mph. Car B is moving at 50mph. Can we determine which car is further along the road?', expectedAnswer: 'No', isDiscriminatingFor: null },
      { id: 'dq_phy_15', type: 'TEXT', content: 'Does knowing speed tell you starting position?', expectedAnswer: 'No', isDiscriminatingFor: '["m_phy_15"]' },
      { id: 'vq_phy_15', type: 'TEXT', content: 'A cheetah runs at 70mph, a turtle walks at 1mph. Is the cheetah definitely ahead of the turtle?', expectedAnswer: 'No', isVerificationFor: 'm_phy_15' }
    ],
    interventions: [{ type: 'micro-explanation', content: 'Velocity tells you how fast position is CHANGING. It does not tell you where the object actually IS.' }]
  }
];
