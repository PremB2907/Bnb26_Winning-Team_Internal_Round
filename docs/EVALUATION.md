# Re:Learn Comprehensive Evaluation Report

## 1. Primary Held-Out Test Performance (test_unseen_question)

- **Overall Accuracy:** 63.89%
- **Bootstrap 95% Confidence Interval (n=1000):** [47.22%, 80.56%]

## 2. Real Component Ablation Study

| Component Removed | Accuracy | Macro-F1 | Delta Accuracy |
|---|---|---|---|
| None (Full B6 Hybrid) | 63.89% | 54.73% | +0.00% |
| Outcome Map Agreement | 63.89% | 54.73% | +0.00% |
| AST Code Features | 63.89% | 54.73% | +0.00% |
| Probability Calibration | 63.89% | 54.73% | +0.00% |

## 3. Simulated Learner BKT Resolution Assessment (N=500)

- **Naive Policy False-Resolution Rate:** 16.80%
- **Our Policy False-Resolution Rate:** 0.00%
- **Our Policy False-Persisting Rate:** 6.20%
- **Mean Probes to Decision:** 2.0

## 4. Error Analysis & Real Failure Cases (Top 15)

| # | Question ID | True Label | Predicted Label | Conf | Failure Reason |
|---|---|---|---|---|---|
| 1 | `q_alias_4` | `M_FALSY_CONFUSION` | `M_STR_MUTABLE` | 0.18 | Model misclassified working text 'Evaluates to False based on standard Python syntax' as M_STR_MUTABLE due to overlapping TF-IDF terms. |
| 2 | `q_alias_4` | `M_FALSY_CONFUSION` | `M_SCOPE_LEAK` | 0.19 | Model misclassified working text 'Tracing the execution step by step gives False for' as M_SCOPE_LEAK due to overlapping TF-IDF terms. |
| 3 | `q_scope_4` | `M_SCOPE_LEAK` | `M_FALSY_CONFUSION` | 0.20 | Model misclassified working text 'Evaluates to 6 based on standard Python syntax.' as M_FALSY_CONFUSION due to overlapping TF-IDF terms. |
| 4 | `q_scope_4` | `M_SCOPE_LEAK` | `M_FALSY_CONFUSION` | 0.18 | Model misclassified working text 'Tracing the execution step by step gives 6 for thi' as M_FALSY_CONFUSION due to overlapping TF-IDF terms. |
| 5 | `q_scope_4` | `M_SCOPE_LEAK` | `M_FALSY_CONFUSION` | 0.24 | Model misclassified working text 'This Python expression unambiguously resolves to 6' as M_FALSY_CONFUSION due to overlapping TF-IDF terms. |
| 6 | `q_scope_4` | `M_SCOPE_LEAK` | `M_FALSY_CONFUSION` | 0.27 | Model misclassified working text 'Not completely sure about the precedence, but gues' as M_FALSY_CONFUSION due to overlapping TF-IDF terms. |
| 7 | `q_print_ret_4` | `M_PRINT_IS_RETURN` | `M_STR_MUTABLE` | 0.20 | Model misclassified working text 'Evaluates to int based on standard Python syntax.' as M_STR_MUTABLE due to overlapping TF-IDF terms. |
| 8 | `q_print_ret_4` | `M_PRINT_IS_RETURN` | `M_SCOPE_LEAK` | 0.20 | Model misclassified working text 'Tracing the execution step by step gives int for t' as M_SCOPE_LEAK due to overlapping TF-IDF terms. |
| 9 | `q_print_ret_4` | `M_PRINT_IS_RETURN` | `M_FALSY_CONFUSION` | 0.24 | Model misclassified working text 'This Python expression unambiguously resolves to i' as M_FALSY_CONFUSION due to overlapping TF-IDF terms. |
| 10 | `q_print_ret_4` | `M_PRINT_IS_RETURN` | `M_FALSY_CONFUSION` | 0.27 | Model misclassified working text 'Not completely sure about the precedence, but gues' as M_FALSY_CONFUSION due to overlapping TF-IDF terms. |
| 11 | `q_str_4` | `M_STR_MUTABLE` | `M_SCOPE_LEAK` | 0.19 | Model misclassified working text 'Tracing the execution step by step gives True for ' as M_SCOPE_LEAK due to overlapping TF-IDF terms. |
| 12 | `q_str_4` | `M_STR_MUTABLE` | `M_FALSY_CONFUSION` | 0.19 | Model misclassified working text 'This Python expression unambiguously resolves to T' as M_FALSY_CONFUSION due to overlapping TF-IDF terms. |
| 13 | `q_str_4` | `M_STR_MUTABLE` | `M_FALSY_CONFUSION` | 0.25 | Model misclassified working text 'Not completely sure about the precedence, but gues' as M_FALSY_CONFUSION due to overlapping TF-IDF terms. |
