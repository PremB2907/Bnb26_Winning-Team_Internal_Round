# Misconception Dataset & Taxonomy Specification

## Taxonomy Overview (12 Misconceptions)

| ID | Name | Severity | Prerequisites | Confusable With |
|---|---|---|---|---|
| `M_ASSIGN_EQ` | Assignment vs Equality Comparison | HIGH | variables, booleans | M_FALSY_CONFUSION |
| `M_OFF_BY_ONE_RANGE` | Inclusive Upper Bound in range() | MEDIUM | loops, indexing | M_ALIAS_COPY |
| `M_ALIAS_COPY` | Assignment Creates Independent List Copy | HIGH | lists, references | M_STR_MUTABLE |
| `M_SCOPE_LEAK` | Function Local Variable Global Accessibility | HIGH | functions, scope | M_PRINT_IS_RETURN |
| `M_PRINT_IS_RETURN` | Print Statement Function Return Equivalence | HIGH | functions, return_values | M_RECURSION_NO_RETURN |
| `M_STR_MUTABLE` | String In-Place Mutation | MEDIUM | strings, immutability | M_ALIAS_COPY |
| `M_OR_CHAIN` | Natural Language Logical OR Precedence | HIGH | booleans, logical_operators | M_FALSY_CONFUSION |
| `M_SWAP_NAIVE` | Sequential Variable Swap Without Temp | MEDIUM | variables, assignment | M_ALIAS_COPY |
| `M_ACC_NOT_RESET` | Accumulator Outer Loop Scope Leak | MEDIUM | nested_loops, accumulators | M_SCOPE_LEAK |
| `M_FALSY_CONFUSION` | Falsy Value Equivalence & Identity | MEDIUM | booleans, types | M_ASSIGN_EQ, M_OR_CHAIN |
| `M_INT_DIV` | Integer Division & Truncation Confusion | LOW | operators, types | M_OFF_BY_ONE_RANGE |
| `M_RECURSION_NO_RETURN` | Unreturned Recursive Call Result | HIGH | functions, recursion | M_PRINT_IS_RETURN |

## Confusability Matrix
Number of question items where pairs of misconceptions produce the **identical wrong prediction**:

| Misconception | `M_ASSIGN_EQ` | `M_OFF_BY_ONE_RANGE` | `M_ALIAS_COPY` | `M_SCOPE_LEAK` | `M_PRINT_IS_RETURN` | `M_STR_MUTABLE` | `M_OR_CHAIN` | `M_SWAP_NAIVE` | `M_ACC_NOT_RESET` | `M_FALSY_CONFUSION` | `M_INT_DIV` | `M_RECURSION_NO_RETURN` |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `M_ASSIGN_EQ` | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 0 |
| `M_OFF_BY_ONE_RANGE` | 0 | 11 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 |
| `M_ALIAS_COPY` | 0 | 0 | 15 | 0 | 0 | 3 | 0 | 1 | 0 | 1 | 0 | 0 |
| `M_SCOPE_LEAK` | 0 | 0 | 0 | 10 | 3 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| `M_PRINT_IS_RETURN` | 0 | 0 | 0 | 3 | 14 | 0 | 0 | 0 | 0 | 2 | 0 | 3 |
| `M_STR_MUTABLE` | 0 | 0 | 3 | 0 | 0 | 8 | 0 | 0 | 0 | 1 | 0 | 0 |
| `M_OR_CHAIN` | 0 | 0 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 4 | 0 | 0 |
| `M_SWAP_NAIVE` | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 6 | 0 | 0 | 0 | 0 |
| `M_ACC_NOT_RESET` | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 7 | 0 | 0 | 0 |
| `M_FALSY_CONFUSION` | 2 | 0 | 1 | 0 | 2 | 1 | 4 | 0 | 0 | 20 | 1 | 0 |
| `M_INT_DIV` | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 8 | 0 |
| `M_RECURSION_NO_RETURN` | 0 | 0 | 0 | 0 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 6 |

## Top Confusable Pairs
- `M_OR_CHAIN` & `M_FALSY_CONFUSION`: **4 overlapping predictions**
- `M_SCOPE_LEAK` & `M_PRINT_IS_RETURN`: **3 overlapping predictions**
- `M_PRINT_IS_RETURN` & `M_RECURSION_NO_RETURN`: **3 overlapping predictions**
- `M_ALIAS_COPY` & `M_STR_MUTABLE`: **3 overlapping predictions**
- `M_PRINT_IS_RETURN` & `M_FALSY_CONFUSION`: **2 overlapping predictions**
