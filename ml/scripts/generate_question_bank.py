import yaml
import sys
import subprocess
import json

# Question bank generation script
questions = []

# M_ASSIGN_EQ
questions.extend([
    {
        "id": "q_assign_eq_1",
        "target_misconceptions": ["M_ASSIGN_EQ"],
        "question_type": "predict-output",
        "tags": ["diagnostic"],
        "prompt": "What is the output of the following code?\n\nx = 5\nif x = 10:\n    print('A')\nelse:\n    print('B')",
        "code_to_verify": "try:\n    exec('''x = 5\\nif x = 10:\\n    print(\"A\")\\nelse:\\n    print(\"B\")''')\nexcept SyntaxError:\n    print('SyntaxError')\n",
        "correct_output": "SyntaxError",
        "predictions": {
            "M_ASSIGN_EQ": "A",
            "M_FALSY_CONFUSION": "B"
        }
    },
    {
        "id": "q_assign_eq_2",
        "target_misconceptions": ["M_ASSIGN_EQ"],
        "question_type": "find-the-bug",
        "tags": ["discriminating"],
        "prompt": "x = 3\nres = (x == 5)\nprint(res)\nWhat does this print?",
        "code_to_verify": "x = 3\nres = (x == 5)\nprint(res)",
        "correct_output": "False",
        "predictions": {
            "M_ASSIGN_EQ": "5",
            "M_FALSY_CONFUSION": "0"
        }
    },
    {
        "id": "q_assign_eq_3",
        "target_misconceptions": ["M_ASSIGN_EQ"],
        "question_type": "fill-the-code",
        "tags": ["transfer_probe"],
        "prompt": "Fill in the blank to check if val equals 100 without modifying val: if val ____ 100:",
        "code_to_verify": "val = 50\nprint('==' in 'if val == 100:')",
        "correct_output": "True",
        "predictions": {
            "M_ASSIGN_EQ": "=",
            "M_FALSY_CONFUSION": "is"
        }
    },
    {
        "id": "q_assign_eq_4",
        "target_misconceptions": ["M_ASSIGN_EQ"],
        "question_type": "predict-output",
        "tags": ["verification"],
        "prompt": "a = 4\nb = (a = 4)\nprint(b)",
        "code_to_verify": "try:\n    exec('''a = 4\\nb = (a = 4)\\nprint(b)''')\nexcept SyntaxError:\n    print('SyntaxError')",
        "correct_output": "SyntaxError",
        "predictions": {
            "M_ASSIGN_EQ": "True",
            "M_FALSY_CONFUSION": "4"
        }
    },
    {
        "id": "q_assign_eq_5",
        "target_misconceptions": ["M_ASSIGN_EQ"],
        "question_type": "explain-why",
        "tags": ["discriminating"],
        "prompt": "Why does `if x = 5:` cause a SyntaxError in Python?",
        "code_to_verify": "print('Assignment is not an expression in Python if statements')",
        "correct_output": "Assignment is not an expression in Python if statements",
        "predictions": {
            "M_ASSIGN_EQ": "Because x is already defined",
            "M_FALSY_CONFUSION": "Because 5 is integer"
        }
    }
])

# M_OFF_BY_ONE_RANGE
questions.extend([
    {
        "id": "q_range_1",
        "target_misconceptions": ["M_OFF_BY_ONE_RANGE"],
        "question_type": "predict-output",
        "tags": ["diagnostic"],
        "prompt": "nums = list(range(1, 5))\nprint(nums)",
        "code_to_verify": "nums = list(range(1, 5))\nprint(nums)",
        "correct_output": "[1, 2, 3, 4]",
        "predictions": {
            "M_OFF_BY_ONE_RANGE": "[1, 2, 3, 4, 5]",
            "M_INT_DIV": "[1, 2, 3]"
        }
    },
    {
        "id": "q_range_2",
        "target_misconceptions": ["M_OFF_BY_ONE_RANGE"],
        "question_type": "predict-output",
        "tags": ["discriminating"],
        "prompt": "total = 0\nfor i in range(3):\n    total += i\nprint(total)",
        "code_to_verify": "total = 0\nfor i in range(3):\n    total += i\nprint(total)",
        "correct_output": "3",
        "predictions": {
            "M_OFF_BY_ONE_RANGE": "6",
            "M_ACC_NOT_RESET": "3"
        }
    },
    {
        "id": "q_range_3",
        "target_misconceptions": ["M_OFF_BY_ONE_RANGE"],
        "question_type": "fill-the-code",
        "tags": ["transfer_probe"],
        "prompt": "To iterate through indices 0 to N inclusive, how should range be called?",
        "code_to_verify": "N = 4\nprint(list(range(0, N + 1)))",
        "correct_output": "[0, 1, 2, 3, 4]",
        "predictions": {
            "M_OFF_BY_ONE_RANGE": "range(0, N)",
            "M_INT_DIV": "range(N)"
        }
    },
    {
        "id": "q_range_4",
        "target_misconceptions": ["M_OFF_BY_ONE_RANGE"],
        "question_type": "predict-output",
        "tags": ["verification"],
        "prompt": "print(len(list(range(2, 6))))",
        "code_to_verify": "print(len(list(range(2, 6))))",
        "correct_output": "4",
        "predictions": {
            "M_OFF_BY_ONE_RANGE": "5",
            "M_INT_DIV": "3"
        }
    },
    {
        "id": "q_range_5",
        "target_misconceptions": ["M_OFF_BY_ONE_RANGE"],
        "question_type": "find-the-bug",
        "tags": ["discriminating"],
        "prompt": "arr = [10, 20, 30]\nfor i in range(len(arr)):\n    print(arr[i])\nDoes this cause an IndexError?",
        "code_to_verify": "arr = [10, 20, 30]\ntry:\n    for i in range(len(arr)):\n        _ = arr[i]\n    print('No')\nexcept IndexError:\n    print('Yes')",
        "correct_output": "No",
        "predictions": {
            "M_OFF_BY_ONE_RANGE": "Yes",
            "M_ALIAS_COPY": "No"
        }
    }
])

# M_ALIAS_COPY
questions.extend([
    {
        "id": "q_alias_1",
        "target_misconceptions": ["M_ALIAS_COPY"],
        "question_type": "predict-output",
        "tags": ["diagnostic"],
        "prompt": "a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)",
        "code_to_verify": "a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)",
        "correct_output": "[1, 2, 3, 4]",
        "predictions": {
            "M_ALIAS_COPY": "[1, 2, 3]",
            "M_STR_MUTABLE": "None"
        }
    },
    {
        "id": "q_alias_2",
        "target_misconceptions": ["M_ALIAS_COPY"],
        "question_type": "predict-output",
        "tags": ["discriminating"],
        "prompt": "x = [5]\ny = x\ny[0] = 99\nprint(x[0])",
        "code_to_verify": "x = [5]\ny = x\ny[0] = 99\nprint(x[0])",
        "correct_output": "99",
        "predictions": {
            "M_ALIAS_COPY": "5",
            "M_SWAP_NAIVE": "5"
        }
    },
    {
        "id": "q_alias_3",
        "target_misconceptions": ["M_ALIAS_COPY"],
        "question_type": "fill-the-code",
        "tags": ["transfer_probe"],
        "prompt": "How do you make an actual shallow copy of list `orig` into `new_list`?",
        "code_to_verify": "orig = [1, 2]\nnew_list = orig.copy()\nnew_list.append(3)\nprint(orig)",
        "correct_output": "[1, 2]",
        "predictions": {
            "M_ALIAS_COPY": "new_list = orig",
            "M_STR_MUTABLE": "new_list = orig.append()"
        }
    },
    {
        "id": "q_alias_4",
        "target_misconceptions": ["M_ALIAS_COPY"],
        "question_type": "predict-output",
        "tags": ["verification"],
        "prompt": "a = [10]\nb = a\nprint(a is b)",
        "code_to_verify": "a = [10]\nb = a\nprint(a is b)",
        "correct_output": "True",
        "predictions": {
            "M_ALIAS_COPY": "False",
            "M_FALSY_CONFUSION": "False"
        }
    },
    {
        "id": "q_alias_5",
        "target_misconceptions": ["M_ALIAS_COPY"],
        "question_type": "explain-why",
        "tags": ["discriminating"],
        "prompt": "Why does changing `b[0]` also change `a[0]` when `b = a`?",
        "code_to_verify": "print('Both variables reference the exact same list object in memory')",
        "correct_output": "Both variables reference the exact same list object in memory",
        "predictions": {
            "M_ALIAS_COPY": "Because b copied a's values",
            "M_STR_MUTABLE": "Because lists are immutable"
        }
    }
])

# M_SCOPE_LEAK
questions.extend([
    {
        "id": "q_scope_1",
        "target_misconceptions": ["M_SCOPE_LEAK"],
        "question_type": "predict-output",
        "tags": ["diagnostic"],
        "prompt": "def set_val():\n    msg = 'hello'\nset_val()\nprint(msg)",
        "code_to_verify": "def set_val():\n    msg = 'hello'\nset_val()\ntry:\n    print(msg)\nexcept NameError:\n    print('NameError')",
        "correct_output": "NameError",
        "predictions": {
            "M_SCOPE_LEAK": "hello",
            "M_PRINT_IS_RETURN": "hello"
        }
    },
    {
        "id": "q_scope_2",
        "target_misconceptions": ["M_SCOPE_LEAK"],
        "question_type": "predict-output",
        "tags": ["discriminating"],
        "prompt": "val = 10\ndef update():\n    val = 20\nupdate()\nprint(val)",
        "code_to_verify": "val = 10\ndef update():\n    val = 20\nupdate()\nprint(val)",
        "correct_output": "10",
        "predictions": {
            "M_SCOPE_LEAK": "20",
            "M_ACC_NOT_RESET": "20"
        }
    },
    {
        "id": "q_scope_3",
        "target_misconceptions": ["M_SCOPE_LEAK"],
        "question_type": "fill-the-code",
        "tags": ["transfer_probe"],
        "prompt": "How to make inner function variable `count` available outside?",
        "code_to_verify": "def get_count():\n    count = 5\n    return count\nres = get_count()\nprint(res)",
        "correct_output": "5",
        "predictions": {
            "M_SCOPE_LEAK": "Just call function without return",
            "M_PRINT_IS_RETURN": "print(count) inside function"
        }
    },
    {
        "id": "q_scope_4",
        "target_misconceptions": ["M_SCOPE_LEAK"],
        "question_type": "predict-output",
        "tags": ["verification"],
        "prompt": "def f(x):\n    y = x + 1\nf(5)\ntry:\n    print(y)\nexcept NameError:\n    print('Error')",
        "code_to_verify": "def f(x):\n    y = x + 1\nf(5)\ntry:\n    print(y)\nexcept NameError:\n    print('Error')",
        "correct_output": "Error",
        "predictions": {
            "M_SCOPE_LEAK": "6",
            "M_PRINT_IS_RETURN": "6"
        }
    },
    {
        "id": "q_scope_5",
        "target_misconceptions": ["M_SCOPE_LEAK"],
        "question_type": "find-the-bug",
        "tags": ["discriminating"],
        "prompt": "def calc():\n    ans = 42\ncalc()\nprint(ans)\nWhy does this fail?",
        "code_to_verify": "print('ans is local to calc() and not defined in global scope')",
        "correct_output": "ans is local to calc() and not defined in global scope",
        "predictions": {
            "M_SCOPE_LEAK": "calc() was not called",
            "M_PRINT_IS_RETURN": "ans was not printed inside calc"
        }
    }
])

# M_PRINT_IS_RETURN
questions.extend([
    {
        "id": "q_print_ret_1",
        "target_misconceptions": ["M_PRINT_IS_RETURN"],
        "question_type": "predict-output",
        "tags": ["diagnostic"],
        "prompt": "def add(a, b):\n    print(a + b)\nres = add(2, 3)\nprint(res)",
        "code_to_verify": "def add(a, b):\n    print(a + b)\nres = add(2, 3)\nprint(res)",
        "correct_output": "5\nNone",
        "predictions": {
            "M_PRINT_IS_RETURN": "5",
            "M_SCOPE_LEAK": "5"
        }
    },
    {
        "id": "q_print_ret_2",
        "target_misconceptions": ["M_PRINT_IS_RETURN"],
        "question_type": "predict-output",
        "tags": ["discriminating"],
        "prompt": "def greet(name):\n    print('Hi ' + name)\nout = greet('Alice')\nprint(out is None)",
        "code_to_verify": "def greet(name):\n    print('Hi ' + name)\nout = greet('Alice')\nprint(out is None)",
        "correct_output": "Hi Alice\nTrue",
        "predictions": {
            "M_PRINT_IS_RETURN": "False",
            "M_FALSY_CONFUSION": "False"
        }
    },
    {
        "id": "q_print_ret_3",
        "target_misconceptions": ["M_PRINT_IS_RETURN"],
        "question_type": "fill-the-code",
        "tags": ["transfer_probe"],
        "prompt": "Fix this function so `double(4) * 2` equals 16:\ndef double(x):\n    ____",
        "code_to_verify": "def double(x):\n    return x * 2\nprint(double(4) * 2)",
        "correct_output": "16",
        "predictions": {
            "M_PRINT_IS_RETURN": "print(x * 2)",
            "M_RECURSION_NO_RETURN": "x * 2"
        }
    },
    {
        "id": "q_print_ret_4",
        "target_misconceptions": ["M_PRINT_IS_RETURN"],
        "question_type": "predict-output",
        "tags": ["verification"],
        "prompt": "def f():\n    print(10)\nx = f()\nprint(type(x).__name__)",
        "code_to_verify": "def f():\n    print(10)\nx = f()\nprint(type(x).__name__)",
        "correct_output": "10\nNoneType",
        "predictions": {
            "M_PRINT_IS_RETURN": "int",
            "M_FALSY_CONFUSION": "int"
        }
    },
    {
        "id": "q_print_ret_5",
        "target_misconceptions": ["M_PRINT_IS_RETURN"],
        "question_type": "explain-why",
        "tags": ["discriminating"],
        "prompt": "What happens when you multiply the result of a function that prints instead of returning?",
        "code_to_verify": "print('TypeError because you cannot multiply None by an integer')",
        "correct_output": "TypeError because you cannot multiply None by an integer",
        "predictions": {
            "M_PRINT_IS_RETURN": "It multiplies the printed number",
            "M_SCOPE_LEAK": "It prints twice"
        }
    }
])

# M_STR_MUTABLE
questions.extend([
    {
        "id": "q_str_1",
        "target_misconceptions": ["M_STR_MUTABLE"],
        "question_type": "predict-output",
        "tags": ["diagnostic"],
        "prompt": "s = 'py'\ns.upper()\nprint(s)",
        "code_to_verify": "s = 'py'\ns.upper()\nprint(s)",
        "correct_output": "py",
        "predictions": {
            "M_STR_MUTABLE": "PY",
            "M_ALIAS_COPY": "PY"
        }
    },
    {
        "id": "q_str_2",
        "target_misconceptions": ["M_STR_MUTABLE"],
        "question_type": "predict-output",
        "tags": ["discriminating"],
        "prompt": "txt = 'hello world'\ntxt.replace('hello', 'hi')\nprint(txt)",
        "code_to_verify": "txt = 'hello world'\ntxt.replace('hello', 'hi')\nprint(txt)",
        "correct_output": "hello world",
        "predictions": {
            "M_STR_MUTABLE": "hi world",
            "M_ALIAS_COPY": "hi world"
        }
    },
    {
        "id": "q_str_3",
        "target_misconceptions": ["M_STR_MUTABLE"],
        "question_type": "fill-the-code",
        "tags": ["transfer_probe"],
        "prompt": "How do you reassign `word` to be uppercase?",
        "code_to_verify": "word = 'cat'\nword = word.upper()\nprint(word)",
        "correct_output": "CAT",
        "predictions": {
            "M_STR_MUTABLE": "word.upper()",
            "M_ALIAS_COPY": "word.upper()"
        }
    },
    {
        "id": "q_str_4",
        "target_misconceptions": ["M_STR_MUTABLE"],
        "question_type": "predict-output",
        "tags": ["verification"],
        "prompt": "s = 'abc'\nres = s.capitalize()\nprint(s == res)",
        "code_to_verify": "s = 'abc'\nres = s.capitalize()\nprint(s == res)",
        "correct_output": "False",
        "predictions": {
            "M_STR_MUTABLE": "True",
            "M_FALSY_CONFUSION": "True"
        }
    },
    {
        "id": "q_str_5",
        "target_misconceptions": ["M_STR_MUTABLE"],
        "question_type": "explain-why",
        "tags": ["discriminating"],
        "prompt": "Why doesn't `text.strip()` modify `text` directly?",
        "code_to_verify": "print('Strings in Python are immutable')",
        "correct_output": "Strings in Python are immutable",
        "predictions": {
            "M_STR_MUTABLE": "Because strip only works on lists",
            "M_ALIAS_COPY": "Because text was copied"
        }
    }
])

# M_OR_CHAIN
questions.extend([
    {
        "id": "q_or_1",
        "target_misconceptions": ["M_OR_CHAIN"],
        "question_type": "predict-output",
        "tags": ["diagnostic"],
        "prompt": "x = 5\nif x == 1 or 2:\n    print('Yes')\nelse:\n    print('No')",
        "code_to_verify": "x = 5\nif x == 1 or 2:\n    print('Yes')\nelse:\n    print('No')",
        "correct_output": "Yes",
        "predictions": {
            "M_OR_CHAIN": "No",
            "M_FALSY_CONFUSION": "No"
        }
    },
    {
        "id": "q_or_2",
        "target_misconceptions": ["M_OR_CHAIN"],
        "question_type": "predict-output",
        "tags": ["discriminating"],
        "prompt": "n = 10\nprint(n == 3 or 0)",
        "code_to_verify": "n = 10\nprint(n == 3 or 0)",
        "correct_output": "0",
        "predictions": {
            "M_OR_CHAIN": "False",
            "M_FALSY_CONFUSION": "False"
        }
    },
    {
        "id": "q_or_3",
        "target_misconceptions": ["M_OR_CHAIN"],
        "question_type": "fill-the-code",
        "tags": ["transfer_probe"],
        "prompt": "Correct code to check if num is either 10 or 20: if ____:",
        "code_to_verify": "num = 10\nprint('num == 10 or num == 20' if num == 10 or num == 20 else 'False')",
        "correct_output": "num == 10 or num == 20",
        "predictions": {
            "M_OR_CHAIN": "num == 10 or 20",
            "M_FALSY_CONFUSION": "num is (10 or 20)"
        }
    },
    {
        "id": "q_or_4",
        "target_misconceptions": ["M_OR_CHAIN"],
        "question_type": "predict-output",
        "tags": ["verification"],
        "prompt": "val = 'apple'\nprint(bool(val == 'banana' or 'cherry'))",
        "code_to_verify": "val = 'apple'\nprint(bool(val == 'banana' or 'cherry'))",
        "correct_output": "True",
        "predictions": {
            "M_OR_CHAIN": "False",
            "M_FALSY_CONFUSION": "False"
        }
    },
    {
        "id": "q_or_5",
        "target_misconceptions": ["M_OR_CHAIN"],
        "question_type": "explain-why",
        "tags": ["discriminating"],
        "prompt": "Why does `x == 1 or 2` evaluate to True when x is 99?",
        "code_to_verify": "print('Because 2 is truthy so (x == 1) or 2 evaluates to 2 which is truthy')",
        "correct_output": "Because 2 is truthy so (x == 1) or 2 evaluates to 2 which is truthy",
        "predictions": {
            "M_OR_CHAIN": "Because x is 99 and 99 is greater than 2",
            "M_FALSY_CONFUSION": "Because 1 or 2 is 3"
        }
    }
])

# M_SWAP_NAIVE
questions.extend([
    {
        "id": "q_swap_1",
        "target_misconceptions": ["M_SWAP_NAIVE"],
        "question_type": "predict-output",
        "tags": ["diagnostic"],
        "prompt": "a = 1\nb = 2\na = b\nb = a\nprint(a, b)",
        "code_to_verify": "a = 1\nb = 2\na = b\nb = a\nprint(a, b)",
        "correct_output": "2 2",
        "predictions": {
            "M_SWAP_NAIVE": "2 1",
            "M_ALIAS_COPY": "1 2"
        }
    },
    {
        "id": "q_swap_2",
        "target_misconceptions": ["M_SWAP_NAIVE"],
        "question_type": "predict-output",
        "tags": ["discriminating"],
        "prompt": "x = 'X'\ny = 'Y'\nx = y\ny = x\nprint(x + y)",
        "code_to_verify": "x = 'X'\ny = 'Y'\nx = y\ny = x\nprint(x + y)",
        "correct_output": "YY",
        "predictions": {
            "M_SWAP_NAIVE": "YX",
            "M_ALIAS_COPY": "XY"
        }
    },
    {
        "id": "q_swap_3",
        "target_misconceptions": ["M_SWAP_NAIVE"],
        "question_type": "fill-the-code",
        "tags": ["transfer_probe"],
        "prompt": "Idiomatic Python swap of a and b in one line: ____",
        "code_to_verify": "a = 10\nb = 20\na, b = b, a\nprint(f'{a},{b}')",
        "correct_output": "20,10",
        "predictions": {
            "M_SWAP_NAIVE": "a = b; b = a",
            "M_ALIAS_COPY": "a = copy(b)"
        }
    },
    {
        "id": "q_swap_4",
        "target_misconceptions": ["M_SWAP_NAIVE"],
        "question_type": "predict-output",
        "tags": ["verification"],
        "prompt": "p = 5\nq = 9\ntemp = p\np = q\nq = temp\nprint(p, q)",
        "code_to_verify": "p = 5\nq = 9\ntemp = p\np = q\nq = temp\nprint(p, q)",
        "correct_output": "9 5",
        "predictions": {
            "M_SWAP_NAIVE": "5 9",
            "M_ALIAS_COPY": "9 9"
        }
    },
    {
        "id": "q_swap_5",
        "target_misconceptions": ["M_SWAP_NAIVE"],
        "question_type": "explain-why",
        "tags": ["discriminating"],
        "prompt": "Why does `a = b; b = a` fail to swap a and b?",
        "code_to_verify": "print('First line overwrites a so its original value is lost')",
        "correct_output": "First line overwrites a so its original value is lost",
        "predictions": {
            "M_SWAP_NAIVE": "It does not fail, it swaps them",
            "M_ALIAS_COPY": "Because b is a reference"
        }
    }
])

# M_ACC_NOT_RESET
questions.extend([
    {
        "id": "q_acc_1",
        "target_misconceptions": ["M_ACC_NOT_RESET"],
        "question_type": "predict-output",
        "tags": ["diagnostic"],
        "prompt": "matrix = [[1, 2], [3, 4]]\ntotal = 0\nfor row in matrix:\n    for val in row:\n        total += val\n    print(total)",
        "code_to_verify": "matrix = [[1, 2], [3, 4]]\ntotal = 0\nfor row in matrix:\n    for val in row:\n        total += val\n    print(total)",
        "correct_output": "3\n10",
        "predictions": {
            "M_ACC_NOT_RESET": "3\n7", # Thinks total resets per row automatically
            "M_SCOPE_LEAK": "3\n4"
        }
    },
    {
        "id": "q_acc_2",
        "target_misconceptions": ["M_ACC_NOT_RESET"],
        "question_type": "predict-output",
        "tags": ["discriminating"],
        "prompt": "groups = [[1, 1], [2, 2]]\ns = 0\nfor g in groups:\n    for item in g:\n        s += item\nprint(s)",
        "code_to_verify": "groups = [[1, 1], [2, 2]]\ns = 0\nfor g in groups:\n    for item in g:\n        s += item\nprint(s)",
        "correct_output": "6",
        "predictions": {
            "M_ACC_NOT_RESET": "4",
            "M_OFF_BY_ONE_RANGE": "2"
        }
    },
    {
        "id": "q_acc_3",
        "target_misconceptions": ["M_ACC_NOT_RESET"],
        "question_type": "find-the-bug",
        "tags": ["transfer_probe"],
        "prompt": "To calculate individual row sums of a 2D grid, where should `row_sum = 0` be placed?",
        "code_to_verify": "print('Inside outer loop before inner loop starts')",
        "correct_output": "Inside outer loop before inner loop starts",
        "predictions": {
            "M_ACC_NOT_RESET": "Before the outer loop",
            "M_SCOPE_LEAK": "Inside the inner loop body"
        }
    },
    {
        "id": "q_acc_4",
        "target_misconceptions": ["M_ACC_NOT_RESET"],
        "question_type": "predict-output",
        "tags": ["verification"],
        "prompt": "count = 0\nfor i in range(2):\n    count = 0\n    for j in range(3):\n        count += 1\nprint(count)",
        "code_to_verify": "count = 0\nfor i in range(2):\n    count = 0\n    for j in range(3):\n        count += 1\nprint(count)",
        "correct_output": "3",
        "predictions": {
            "M_ACC_NOT_RESET": "6",
            "M_OFF_BY_ONE_RANGE": "4"
        }
    },
    {
        "id": "q_acc_5",
        "target_misconceptions": ["M_ACC_NOT_RESET"],
        "question_type": "explain-why",
        "tags": ["discriminating"],
        "prompt": "What bug happens if `subtotal = 0` is outside a nested loop calculating row totals?",
        "code_to_verify": "print('Previous row sums carry over into subsequent row calculations')",
        "correct_output": "Previous row sums carry over into subsequent row calculations",
        "predictions": {
            "M_ACC_NOT_RESET": "It resets automatically per row",
            "M_SCOPE_LEAK": "subtotal cannot be accessed"
        }
    }
])

# M_FALSY_CONFUSION
questions.extend([
    {
        "id": "q_falsy_1",
        "target_misconceptions": ["M_FALSY_CONFUSION"],
        "question_type": "predict-output",
        "tags": ["diagnostic"],
        "prompt": "print([] == None)",
        "code_to_verify": "print([] == None)",
        "correct_output": "False",
        "predictions": {
            "M_FALSY_CONFUSION": "True",
            "M_ASSIGN_EQ": "True"
        }
    },
    {
        "id": "q_falsy_2",
        "target_misconceptions": ["M_FALSY_CONFUSION"],
        "question_type": "predict-output",
        "tags": ["discriminating"],
        "prompt": "print(0 == '')",
        "code_to_verify": "print(0 == '')",
        "correct_output": "False",
        "predictions": {
            "M_FALSY_CONFUSION": "True",
            "M_OR_CHAIN": "True"
        }
    },
    {
        "id": "q_falsy_3",
        "target_misconceptions": ["M_FALSY_CONFUSION"],
        "question_type": "predict-output",
        "tags": ["transfer_probe"],
        "prompt": "x = []\nprint(bool(x))",
        "code_to_verify": "x = []\nprint(bool(x))",
        "correct_output": "False",
        "predictions": {
            "M_FALSY_CONFUSION": "None",
            "M_ASSIGN_EQ": "True"
        }
    },
    {
        "id": "q_falsy_4",
        "target_misconceptions": ["M_FALSY_CONFUSION"],
        "question_type": "predict-output",
        "tags": ["verification"],
        "prompt": "print(False == 0)",
        "code_to_verify": "print(False == 0)",
        "correct_output": "True",
        "predictions": {
            "M_FALSY_CONFUSION": "False",
            "M_ASSIGN_EQ": "False"
        }
    },
    {
        "id": "q_falsy_5",
        "target_misconceptions": ["M_FALSY_CONFUSION"],
        "question_type": "explain-why",
        "tags": ["discriminating"],
        "prompt": "Why does `bool([])` equal `False` but `[] == False` equals `False`?",
        "code_to_verify": "print('An empty list is falsy in boolean context but not equal to the boolean False object')",
        "correct_output": "An empty list is falsy in boolean context but not equal to the boolean False object",
        "predictions": {
            "M_FALSY_CONFUSION": "They are identical objects",
            "M_ASSIGN_EQ": "Because single equals was used"
        }
    }
])

# M_INT_DIV
questions.extend([
    {
        "id": "q_div_1",
        "target_misconceptions": ["M_INT_DIV"],
        "question_type": "predict-output",
        "tags": ["diagnostic"],
        "prompt": "print(7 / 2)",
        "code_to_verify": "print(7 / 2)",
        "correct_output": "3.5",
        "predictions": {
            "M_INT_DIV": "3",
            "M_OFF_BY_ONE_RANGE": "4"
        }
    },
    {
        "id": "q_div_2",
        "target_misconceptions": ["M_INT_DIV"],
        "question_type": "predict-output",
        "tags": ["discriminating"],
        "prompt": "print(-7 // 2)",
        "code_to_verify": "print(-7 // 2)",
        "correct_output": "-4",
        "predictions": {
            "M_INT_DIV": "-3",
            "M_OFF_BY_ONE_RANGE": "-3"
        }
    },
    {
        "id": "q_div_3",
        "target_misconceptions": ["M_INT_DIV"],
        "question_type": "fill-the-code",
        "tags": ["transfer_probe"],
        "prompt": "Which operator performs floor division in Python?",
        "code_to_verify": "print('//')",
        "correct_output": "//",
        "predictions": {
            "M_INT_DIV": "/",
            "M_OFF_BY_ONE_RANGE": "%"
        }
    },
    {
        "id": "q_div_4",
        "target_misconceptions": ["M_INT_DIV"],
        "question_type": "predict-output",
        "tags": ["verification"],
        "prompt": "print(type(4 / 2).__name__)",
        "code_to_verify": "print(type(4 / 2).__name__)",
        "correct_output": "float",
        "predictions": {
            "M_INT_DIV": "int",
            "M_FALSY_CONFUSION": "int"
        }
    },
    {
        "id": "q_div_5",
        "target_misconceptions": ["M_INT_DIV"],
        "question_type": "explain-why",
        "tags": ["discriminating"],
        "prompt": "Why does `-7 // 2` return `-4` instead of `-3`?",
        "code_to_verify": "print('Floor division rounds down towards negative infinity')",
        "correct_output": "Floor division rounds down towards negative infinity",
        "predictions": {
            "M_INT_DIV": "Because it truncates the decimal .5",
            "M_OFF_BY_ONE_RANGE": "Because 7/2 is 3.5"
        }
    }
])

# M_RECURSION_NO_RETURN
questions.extend([
    {
        "id": "q_rec_1",
        "target_misconceptions": ["M_RECURSION_NO_RETURN"],
        "question_type": "predict-output",
        "tags": ["diagnostic"],
        "prompt": "def sum_to(n):\n    if n <= 1:\n        return 1\n    sum_to(n - 1) + n\nprint(sum_to(3))",
        "code_to_verify": "def sum_to(n):\n    if n <= 1:\n        return 1\n    sum_to(n - 1) + n\ntry:\n    print(sum_to(3))\nexcept TypeError:\n    print('TypeError')",
        "correct_output": "TypeError",
        "predictions": {
            "M_RECURSION_NO_RETURN": "6",
            "M_PRINT_IS_RETURN": "6"
        }
    },
    {
        "id": "q_rec_2",
        "target_misconceptions": ["M_RECURSION_NO_RETURN"],
        "question_type": "predict-output",
        "tags": ["discriminating"],
        "prompt": "def find_first(lst):\n    if not lst:\n        return None\n    if lst[0] > 0:\n        return lst[0]\n    find_first(lst[1:])\nprint(find_first([-1, 5]))",
        "code_to_verify": "def find_first(lst):\n    if not lst:\n        return None\n    if lst[0] > 0:\n        return lst[0]\n    find_first(lst[1:])\nprint(find_first([-1, 5]))",
        "correct_output": "None",
        "predictions": {
            "M_RECURSION_NO_RETURN": "5",
            "M_PRINT_IS_RETURN": "5"
        }
    },
    {
        "id": "q_rec_3",
        "target_misconceptions": ["M_RECURSION_NO_RETURN"],
        "question_type": "find-the-bug",
        "tags": ["transfer_probe"],
        "prompt": "def fact(n):\n    if n == 1: return 1\n    fact(n - 1) * n\nWhy does fact(4) return None?",
        "code_to_verify": "print('Missing return keyword before recursive call fact(n - 1)')",
        "correct_output": "Missing return keyword before recursive call fact(n - 1)",
        "predictions": {
            "M_RECURSION_NO_RETURN": "Because n==1 returns 1",
            "M_PRINT_IS_RETURN": "Because fact(4) needs print()"
        }
    },
    {
        "id": "q_rec_4",
        "target_misconceptions": ["M_RECURSION_NO_RETURN"],
        "question_type": "predict-output",
        "tags": ["verification"],
        "prompt": "def countdown(n):\n    if n == 0: return 'Done'\n    return countdown(n - 1)\nprint(countdown(2))",
        "code_to_verify": "def countdown(n):\n    if n == 0: return 'Done'\n    return countdown(n - 1)\nprint(countdown(2))",
        "correct_output": "Done",
        "predictions": {
            "M_RECURSION_NO_RETURN": "None",
            "M_PRINT_IS_RETURN": "None"
        }
    },
    {
        "id": "q_rec_5",
        "target_misconceptions": ["M_RECURSION_NO_RETURN"],
        "question_type": "explain-why",
        "tags": ["discriminating"],
        "prompt": "Why must you explicitly write `return` in front of a recursive call?",
        "code_to_verify": "print('To pass the inner stack frame return value up to the caller')",
        "correct_output": "To pass the inner stack frame return value up to the caller",
        "predictions": {
            "M_RECURSION_NO_RETURN": "You don't need return if base case has return",
            "M_PRINT_IS_RETURN": "To print the final result"
        }
    }
])

with open("ml/data/question_bank.yaml", "w") as f:
    yaml.dump({"questions": questions}, f, sort_keys=False)

print(f"Generated {len(questions)} question items in ml/data/question_bank.yaml")
