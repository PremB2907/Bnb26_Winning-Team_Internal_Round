export const programmingConcepts = [
  { id: 'c_prog_1', name: 'Variables & Scope', description: 'Understanding how variables store data and their visibility.' },
  { id: 'c_prog_2', name: 'Control Flow', description: 'Conditionals, loops, and branching logic.' },
  { id: 'c_prog_3', name: 'Functions', description: 'Parameters, arguments, return values, and recursion.' },
  { id: 'c_prog_4', name: 'Data Structures', description: 'Arrays, lists, references, and mutability.' }
];

export const programmingMisconceptions = [
  // Concept 1: Variables & Scope
  {
    id: 'm_prog_1', conceptId: 'c_prog_1',
    name: 'Assignment vs Equality',
    description: 'Confusing the assignment operator (=) with the equality operator (==).',
    correctReasoning: 'Assignment sets a value; equality checks a value.',
    incorrectReasoningPatterns: '["Condition evaluates to true because x is set to 5", "x becomes 5"]',
    triggerPatterns: '["if (x = 5)", "while (y = true)"]',
    severity: 'HIGH',
    questions: [
      { id: 'q_prog_1', type: 'CODE', content: 'if (x = 10) { print("A") } else { print("B") }', expectedAnswer: 'A', isDiscriminatingFor: null },
      { id: 'dq_prog_1', type: 'TEXT', content: 'What does `x = 10` do inside the if condition?', expectedAnswer: 'It assigns 10 to x and evaluates as truthy.', isDiscriminatingFor: '["m_prog_1"]' },
      { id: 'vq_prog_1', type: 'CODE', content: 'if (y = 0) { print("yes") } else { print("no") }', expectedAnswer: 'no', isVerificationFor: 'm_prog_1' }
    ],
    interventions: [
      { type: 'micro-explanation', content: 'Remember, a single `=` is an instruction to put a value in a box. A double `==` is a question asking if the values are the same.' }
    ]
  },
  {
    id: 'm_prog_2', conceptId: 'c_prog_1',
    name: 'Scope Misunderstanding',
    description: 'Believing variables declared inside a block or function are accessible outside.',
    correctReasoning: 'Local variables only exist within their enclosing block.',
    incorrectReasoningPatterns: '["The function updates the global variable", "x is still 5 outside"]',
    triggerPatterns: '["ReferenceError", "print(local_var)"]',
    severity: 'MEDIUM',
    questions: [
      { id: 'q_prog_2', type: 'CODE', content: 'def foo():\\n  x = 5\\nfoo()\\nprint(x)', expectedAnswer: 'Error', isDiscriminatingFor: null },
      { id: 'dq_prog_2', type: 'TEXT', content: 'Where does the variable x exist?', expectedAnswer: 'Only inside foo()', isDiscriminatingFor: '["m_prog_2"]' },
      { id: 'vq_prog_2', type: 'CODE', content: 'if True:\\n  y = 10\\nprint(y)', expectedAnswer: '10', isVerificationFor: 'm_prog_2' }
    ],
    interventions: [
      { type: 'analogy', content: 'Variables inside a function are like secrets kept in a room. Once the function finishes and the room closes, the secrets are gone.' }
    ]
  },
  {
    id: 'm_prog_3', conceptId: 'c_prog_1',
    name: 'Null/None Misunderstanding',
    description: 'Treating Null or None as the string "null" or integer 0.',
    correctReasoning: 'Null represents the intentional absence of any object value.',
    incorrectReasoningPatterns: '["null means zero", "None equals false"]',
    triggerPatterns: '["x == 0 when x is None", "x == false when x is None"]',
    severity: 'LOW',
    questions: [
      { id: 'q_prog_3', type: 'CODE', content: 'x = None\\nif x == 0:\\n  print("Zero")\\nelse:\\n  print("None")', expectedAnswer: 'None', isDiscriminatingFor: null },
      { id: 'dq_prog_3', type: 'TEXT', content: 'Is None mathematically equal to 0?', expectedAnswer: 'No', isDiscriminatingFor: '["m_prog_3"]' },
      { id: 'vq_prog_3', type: 'CODE', content: 'y = null\\nif (y == "") print("Empty"); else print("Null");', expectedAnswer: 'Null', isVerificationFor: 'm_prog_3' }
    ],
    interventions: [
      { type: 'worked-example', content: '0 is a number. An empty string "" is a string with no characters. Null is the complete absence of a value. They are not the same.' }
    ]
  },

  // Concept 2: Control Flow
  {
    id: 'm_prog_4', conceptId: 'c_prog_2',
    name: 'Condition Inversion',
    description: 'Interpreting a boolean condition as its exact opposite.',
    correctReasoning: 'The if block executes when the condition is strictly True.',
    incorrectReasoningPatterns: '["Selected else when true", "> interpreted as <"]',
    triggerPatterns: '["if (x > 5) evaluates to false for x=10"]',
    severity: 'HIGH',
    questions: [
      { id: 'q_prog_4', type: 'CODE', content: 'x = 10\\nif x > 5: print("A")\\nelse: print("B")', expectedAnswer: 'A', isDiscriminatingFor: null },
      { id: 'dq_prog_4', type: 'TEXT', content: 'Is 10 strictly greater than 5?', expectedAnswer: 'Yes', isDiscriminatingFor: '["m_prog_4"]' },
      { id: 'vq_prog_4', type: 'CODE', content: 'age = 18\\nif age < 21: print("Minor")\\nelse: print("Adult")', expectedAnswer: 'Minor', isVerificationFor: 'm_prog_4' }
    ],
    interventions: [
      { type: 'micro-explanation', content: 'Read the condition out loud. "Is x greater than 5?" Since x=10, the answer is Yes (True).' }
    ]
  },
  {
    id: 'm_prog_5', conceptId: 'c_prog_2',
    name: 'Loop Termination Misunderstanding',
    description: 'Believing a loop terminates as soon as a condition is met internally, not at the loop header.',
    correctReasoning: 'Loop conditions are evaluated only at the start of each iteration.',
    incorrectReasoningPatterns: '["It stops immediately inside the block", "Breaks automatically"]',
    triggerPatterns: '["while (x < 5): x += 2; print(x)"]',
    severity: 'MEDIUM',
    questions: [
      { id: 'q_prog_5', type: 'CODE', content: 'x=0\\nwhile x < 3:\\n  x += 2\\n  print(x)', expectedAnswer: '2, 4', isDiscriminatingFor: null },
      { id: 'dq_prog_5', type: 'TEXT', content: 'Does the while loop check `x < 3` immediately after `x += 2`?', expectedAnswer: 'No', isDiscriminatingFor: '["m_prog_5"]' },
      { id: 'vq_prog_5', type: 'CODE', content: 'i=0\\nwhile i != 3:\\n  i += 2\\nprint(i)', expectedAnswer: 'Infinite loop', isVerificationFor: 'm_prog_5' }
    ],
    interventions: [
      { type: 'code-trace', content: 'Let us trace it. x=0. 0<3 is True. x becomes 2. Prints 2. Next iteration: 2<3 is True. x becomes 4. Prints 4. Next iteration: 4<3 is False. Stops.' }
    ]
  },
  {
    id: 'm_prog_6', conceptId: 'c_prog_2',
    name: 'Boolean AND/OR Confusion',
    description: 'Confusing logical AND with logical OR in complex conditionals.',
    correctReasoning: 'AND requires all conditions to be true. OR requires at least one condition to be true.',
    incorrectReasoningPatterns: '["It prints true because one of them is true for AND", "Confused English \'and\' with boolean AND"]',
    triggerPatterns: '["if (a > 5 and b > 5)"]',
    severity: 'HIGH',
    questions: [
      { id: 'q_prog_6', type: 'CODE', content: 'if (10 > 5 and 2 > 5): print("Yes")\\nelse: print("No")', expectedAnswer: 'No', isDiscriminatingFor: null },
      { id: 'dq_prog_6', type: 'TEXT', content: 'In natural language we say "I want an apple AND a banana". In programming, does AND mean we get both?', expectedAnswer: 'It means both conditions MUST evaluate to true simultaneously.', isDiscriminatingFor: '["m_prog_6"]' },
      { id: 'vq_prog_6', type: 'CODE', content: 'if (10 > 5 or 2 > 5): print("Yes")\\nelse: print("No")', expectedAnswer: 'Yes', isVerificationFor: 'm_prog_6' }
    ],
    interventions: [
      { type: 'analogy', content: 'AND means both keys must be turned to launch the missile. OR means either key can launch it.' }
    ]
  },
  {
    id: 'm_prog_7', conceptId: 'c_prog_2',
    name: 'Operator Precedence Misunderstanding',
    description: 'Evaluating expressions left-to-right regardless of operator precedence (PEMDAS/BODMAS).',
    correctReasoning: 'Operators like *, /, and AND have higher precedence than +, -, and OR.',
    incorrectReasoningPatterns: '["Evaluated left to right", "Ignored * priority"]',
    triggerPatterns: '["2 + 3 * 4 == 20"]',
    severity: 'MEDIUM',
    questions: [
      { id: 'q_prog_7', type: 'CODE', content: 'print(2 + 3 * 4)', expectedAnswer: '14', isDiscriminatingFor: null },
      { id: 'dq_prog_7', type: 'TEXT', content: 'Which operation happens first: 2 + 3, or 3 * 4?', expectedAnswer: '3 * 4', isDiscriminatingFor: '["m_prog_7"]' },
      { id: 'vq_prog_7', type: 'CODE', content: 'print(10 - 4 / 2)', expectedAnswer: '8', isVerificationFor: 'm_prog_7' }
    ],
    interventions: [
      { type: 'micro-explanation', content: 'Multiplication and division happen BEFORE addition and subtraction, unless you use parentheses.' }
    ]
  },

  // Concept 3: Functions
  {
    id: 'm_prog_8', conceptId: 'c_prog_3',
    name: 'Return vs Print Confusion',
    description: 'Believing that printing a value in a function makes it available to the caller.',
    correctReasoning: 'Print outputs to console. Return sends a value back to the code that called the function.',
    incorrectReasoningPatterns: '["The function returns 5 because it prints 5", "Variable gets the printed value"]',
    triggerPatterns: '["def f(): print(5); x = f(); print(x)"]',
    severity: 'HIGH',
    questions: [
      { id: 'q_prog_8', type: 'CODE', content: 'def add(a,b): print(a+b)\\nx = add(2,3)\\nprint(x)', expectedAnswer: '5\\nNone', isDiscriminatingFor: null },
      { id: 'dq_prog_8', type: 'TEXT', content: 'Does the `add` function actually hand the number 5 back to the variable `x`?', expectedAnswer: 'No, it just prints it to the screen.', isDiscriminatingFor: '["m_prog_8"]' },
      { id: 'vq_prog_8', type: 'CODE', content: 'def get_name(): print("Alice")\\nname = get_name()\\nif name == "Alice": print("Yes")\\nelse: print("No")', expectedAnswer: 'Alice\\nNo', isVerificationFor: 'm_prog_8' }
    ],
    interventions: [
      { type: 'analogy', content: 'Print is like shouting the answer to a room. Return is like writing the answer on a piece of paper and handing it directly to the person who asked.' }
    ]
  },
  {
    id: 'm_prog_9', conceptId: 'c_prog_3',
    name: 'Parameter vs Argument Mix-up',
    description: 'Confusing the names of variables passed into a function with the names of parameters inside it.',
    correctReasoning: 'Arguments are the actual values passed; parameters are local variables inside the function that receive those values.',
    incorrectReasoningPatterns: '["x must be called x outside", "Cannot pass y to parameter x"]',
    triggerPatterns: '["def foo(x): pass; y=2; foo(y) => Error?"]',
    severity: 'LOW',
    questions: [
      { id: 'q_prog_9', type: 'CODE', content: 'def double(x): return x*2\\ny = 4\\nprint(double(y))', expectedAnswer: '8', isDiscriminatingFor: null },
      { id: 'dq_prog_9', type: 'TEXT', content: 'Does the variable passed into `double` have to be named `x`?', expectedAnswer: 'No, it can be any variable.', isDiscriminatingFor: '["m_prog_9"]' },
      { id: 'vq_prog_9', type: 'CODE', content: 'def greet(name): print(name)\\nuser = "Bob"\\ngreet(user)', expectedAnswer: 'Bob', isVerificationFor: 'm_prog_9' }
    ],
    interventions: [
      { type: 'worked-example', content: 'Parameters are just placeholders. When you call `double(y)`, the function temporarily assigns `x = y` internally.' }
    ]
  },
  {
    id: 'm_prog_10', conceptId: 'c_prog_3',
    name: 'Recursion Base Case Omission',
    description: 'Failing to provide a terminating condition in a recursive function.',
    correctReasoning: 'Recursive functions must have a base case that returns without calling itself.',
    incorrectReasoningPatterns: '["Function will eventually stop automatically", "Infinite recursion not recognized"]',
    triggerPatterns: '["def f(n): return f(n-1)"]',
    severity: 'HIGH',
    questions: [
      { id: 'q_prog_10', type: 'CODE', content: 'def count(n):\\n  print(n)\\n  count(n-1)\\ncount(5)', expectedAnswer: 'Infinite loop / Stack Overflow', isDiscriminatingFor: null },
      { id: 'dq_prog_10', type: 'TEXT', content: 'Under what condition does this function stop calling itself?', expectedAnswer: 'It never stops.', isDiscriminatingFor: '["m_prog_10"]' },
      { id: 'vq_prog_10', type: 'CODE', content: 'def run():\\n  run()\\nrun()', expectedAnswer: 'Stack Overflow', isVerificationFor: 'm_prog_10' }
    ],
    interventions: [
      { type: 'micro-explanation', content: 'Without an `if` statement to stop it (a base case), a recursive function will call itself forever until the program crashes.' }
    ]
  },

  // Concept 4: Data Structures
  {
    id: 'm_prog_11', conceptId: 'c_prog_4',
    name: 'Off-by-One Indexing',
    description: 'Accessing an array using 1-based indexing instead of 0-based indexing.',
    correctReasoning: 'Most languages use 0-based indexing for arrays.',
    incorrectReasoningPatterns: '["arr[1] is the first element", "Length is the last index"]',
    triggerPatterns: '["arr = [10, 20]; print(arr[2])"]',
    severity: 'HIGH',
    questions: [
      { id: 'q_prog_11', type: 'CODE', content: 'arr = ["A", "B", "C"]\\nprint(arr[1])', expectedAnswer: 'B', isDiscriminatingFor: null },
      { id: 'dq_prog_11', type: 'TEXT', content: 'What index corresponds to the letter "A"?', expectedAnswer: '0', isDiscriminatingFor: '["m_prog_11"]' },
      { id: 'vq_prog_11', type: 'CODE', content: 'nums = [5, 10, 15]\\nprint(nums[3])', expectedAnswer: 'Error/Undefined', isVerificationFor: 'm_prog_11' }
    ],
    interventions: [
      { type: 'analogy', content: 'Think of array indices as "offset distance from the start". The first element is 0 distance from the start.' }
    ]
  },
  {
    id: 'm_prog_12', conceptId: 'c_prog_4',
    name: 'Mutable vs Immutable Behavior',
    description: 'Believing that mutating a reference type creates a new copy automatically.',
    correctReasoning: 'Objects and arrays are passed by reference. Mutating them affects all variables pointing to that reference.',
    incorrectReasoningPatterns: '["b is a separate list", "Changing b doesn\'t change a"]',
    triggerPatterns: '["a = [1]; b = a; b.append(2)"]',
    severity: 'HIGH',
    questions: [
      { id: 'q_prog_12', type: 'CODE', content: 'a = [1, 2]\\nb = a\\nb.append(3)\\nprint(a)', expectedAnswer: '[1, 2, 3]', isDiscriminatingFor: null },
      { id: 'dq_prog_12', type: 'TEXT', content: 'Does `b = a` create a brand new list, or just a new name for the same list?', expectedAnswer: 'A new name for the same list.', isDiscriminatingFor: '["m_prog_12"]' },
      { id: 'vq_prog_12', type: 'CODE', content: 'x = {"val": 10}\\ny = x\\ny["val"] = 20\\nprint(x["val"])', expectedAnswer: '20', isVerificationFor: 'm_prog_12' }
    ],
    interventions: [
      { type: 'analogy', content: 'If `a` is a house address, `b = a` just gives `b` the same address. If someone paints the house at `b` red, the house at `a` is also red, because it is the exact same house.' }
    ]
  },
  {
    id: 'm_prog_13', conceptId: 'c_prog_4',
    name: 'Integer Division Misunderstanding',
    description: 'Assuming division of two integers always produces a float (in languages like Java/C).',
    correctReasoning: 'Integer division discards the remainder, truncating toward zero.',
    incorrectReasoningPatterns: '["5/2 is 2.5", "Type doesn\'t matter"]',
    triggerPatterns: '["int x = 5 / 2;"]',
    severity: 'MEDIUM',
    questions: [
      { id: 'q_prog_13', type: 'CODE', content: '// Java/C\\nint result = 5 / 2;\\nprint(result);', expectedAnswer: '2', isDiscriminatingFor: null },
      { id: 'dq_prog_13', type: 'TEXT', content: 'Can an integer variable store the decimal .5?', expectedAnswer: 'No', isDiscriminatingFor: '["m_prog_13"]' },
      { id: 'vq_prog_13', type: 'CODE', content: 'int ans = 9 / 4;\\nprint(ans);', expectedAnswer: '2', isVerificationFor: 'm_prog_13' }
    ],
    interventions: [
      { type: 'micro-explanation', content: 'When dividing two integers in strongly typed languages, the decimal portion is completely chopped off.' }
    ]
  },
  {
    id: 'm_prog_14', conceptId: 'c_prog_4',
    name: 'Shallow vs Deep Copy',
    description: 'Believing a shallow copy duplicates nested objects.',
    correctReasoning: 'Shallow copies duplicate the top level, but nested objects are still references.',
    incorrectReasoningPatterns: '["It\'s completely cloned", "Nested array changed but shouldn\'t have"]',
    triggerPatterns: '["copy = list(original); copy[0][0] = 5"]',
    severity: 'MEDIUM',
    questions: [
      { id: 'q_prog_14', type: 'CODE', content: 'a = [[1], [2]]\\nb = list(a)\\nb[0].append(9)\\nprint(a)', expectedAnswer: '[[1, 9], [2]]', isDiscriminatingFor: null },
      { id: 'dq_prog_14', type: 'TEXT', content: 'Did `list(a)` create copies of the inner arrays?', expectedAnswer: 'No, only the outer array.', isDiscriminatingFor: '["m_prog_14"]' },
      { id: 'vq_prog_14', type: 'CODE', content: 'orig = {"inner": [1]}\\ncpy = orig.copy()\\ncpy["inner"].append(2)\\nprint(orig["inner"])', expectedAnswer: '[1, 2]', isVerificationFor: 'm_prog_14' }
    ],
    interventions: [
      { type: 'micro-explanation', content: 'A shallow copy only copies the outermost container. Any nested lists or objects inside are still shared references.' }
    ]
  },
  {
    id: 'm_prog_15', conceptId: 'c_prog_1',
    name: 'String Immutability',
    description: 'Attempting to modify a string in-place in languages where strings are immutable.',
    correctReasoning: 'Strings cannot be changed after creation; you must reassign them to a new string.',
    incorrectReasoningPatterns: '["s[0] = \'A\' changes the string", "Strings are like arrays"]',
    triggerPatterns: '["s = \'hello\'; s[0] = \'H\'"]',
    severity: 'MEDIUM',
    questions: [
      { id: 'q_prog_15', type: 'CODE', content: 's = "hello"\\ns[0] = "H"\\nprint(s)', expectedAnswer: 'Error', isDiscriminatingFor: null },
      { id: 'dq_prog_15', type: 'TEXT', content: 'Can you overwrite a single character in a Python string?', expectedAnswer: 'No, strings are immutable.', isDiscriminatingFor: '["m_prog_15"]' },
      { id: 'vq_prog_15', type: 'CODE', content: 'txt = "abc"\\ntxt.replace("a", "x")\\nprint(txt)', expectedAnswer: 'abc (unless reassigned)', isVerificationFor: 'm_prog_15' }
    ],
    interventions: [
      { type: 'micro-explanation', content: 'Strings are carved in stone. You cannot change a piece of them. You must create an entirely new string and reassign it.' }
    ]
  }
];
