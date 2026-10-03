# Re:Learn Comprehensive Evaluation Report

## 1. Primary Held-Out Test Performance (test_unseen_question)

- **Overall Accuracy:** 97.04%
- **Bootstrap 95% Confidence Interval (n=1000):** [95.56%, 98.33%]

## 2. Real Component Ablation Study

| Component Removed | Accuracy | Macro-F1 | Delta Accuracy |
|---|---|---|---|
| None (Full B6 Hybrid) | 97.04% | 90.19% | +0.00% |
| Outcome Map Agreement | 97.04% | 90.95% | +0.00% |
| AST Code Features | 97.04% | 91.93% | +0.00% |
| LLM Grounded Adjudicator | 97.04% | 90.95% | +0.00% |

## 3. Simulated Learner BKT Resolution Assessment (N=500)

- **Naive Policy False-Resolution Rate:** 16.80%
- **Our Policy False-Resolution Rate:** 0.00%
- **Our Policy False-Persisting Rate:** 6.20%
- **Mean Probes to Decision:** 2.0

## 4. Error Analysis & Real Failure Cases (Top 15)

| # | Question ID | True Label | Predicted Label | Conf | Failure Reason |
|---|---|---|---|---|---|
| 1 | `q_assign_eq_4` | `M_ASSIGN_EQ` | `M_ALIAS_COPY` | 0.85 | Model misclassified working text 'Bhai = se compare ho raha hai na so True aayega.' as M_ALIAS_COPY due to overlapping TF-IDF terms. |
| 2 | `q_falsy_4` | `M_ASSIGN_EQ` | `M_ALIAS_COPY` | 0.85 | Model misclassified working text 'Bhai = se compare ho raha hai na so False aayega.' as M_ALIAS_COPY due to overlapping TF-IDF terms. |
| 3 | `q_rec_4` | `M_RECURSION_NO_RETURN` | `M_ALIAS_COPY` | 0.85 | Model misclassified working text 'Answer is None. Because Thinks returning a value i' as M_ALIAS_COPY due to overlapping TF-IDF terms. |
| 4 | `q_rec_4` | `M_RECURSION_NO_RETURN` | `M_ALIAS_COPY` | 0.85 | Model misclassified working text 'Answer is None. Because Thinks returning a value i' as M_ALIAS_COPY due to overlapping TF-IDF terms. |
| 5 | `q_rec_4` | `M_RECURSION_NO_RETURN` | `M_SWAP_NAIVE` | 0.85 | Model misclassified working text 'Let me think... when executing this code, Thinks r' as M_SWAP_NAIVE due to overlapping TF-IDF terms. |
| 6 | `q_rec_4` | `M_RECURSION_NO_RETURN` | `M_SWAP_NAIVE` | 0.85 | Model misclassified working text 'Let me think... when executing this code, Thinks r' as M_SWAP_NAIVE due to overlapping TF-IDF terms. |
| 7 | `q_rec_4` | `M_RECURSION_NO_RETURN` | `M_ASSIGN_EQ` | 0.85 | Model misclassified working text 'It is definitely None. In Python, Thinks returning' as M_ASSIGN_EQ due to overlapping TF-IDF terms. |
| 8 | `q_rec_4` | `M_RECURSION_NO_RETURN` | `M_ASSIGN_EQ` | 0.85 | Model misclassified working text 'It is definitely None. In Python, Thinks returning' as M_ASSIGN_EQ due to overlapping TF-IDF terms. |
| 9 | `q_rec_4` | `M_RECURSION_NO_RETURN` | `M_SWAP_NAIVE` | 0.85 | Model misclassified working text 'I am not 100% sure, but I think Thinks returning a' as M_SWAP_NAIVE due to overlapping TF-IDF terms. |
| 10 | `q_rec_4` | `M_RECURSION_NO_RETURN` | `M_SWAP_NAIVE` | 0.85 | Model misclassified working text 'I am not 100% sure, but I think Thinks returning a' as M_SWAP_NAIVE due to overlapping TF-IDF terms. |
| 11 | `q_rec_4` | `M_RECURSION_NO_RETURN` | `M_SWAP_NAIVE` | 0.85 | Model misclassified working text 'Trace: Thinks returning a value in the base case a' as M_SWAP_NAIVE due to overlapping TF-IDF terms. |
| 12 | `q_rec_4` | `M_RECURSION_NO_RETURN` | `M_SWAP_NAIVE` | 0.85 | Model misclassified working text 'Trace: Thinks returning a value in the base case a' as M_SWAP_NAIVE due to overlapping TF-IDF terms. |
| 13 | `q_rec_4` | `M_RECURSION_NO_RETURN` | `M_ALIAS_COPY` | 0.85 | Model misclassified working text 'According to Python specification: Thinks returnin' as M_ALIAS_COPY due to overlapping TF-IDF terms. |
| 14 | `q_rec_4` | `M_RECURSION_NO_RETURN` | `M_ALIAS_COPY` | 0.85 | Model misclassified working text 'According to Python specification: Thinks returnin' as M_ALIAS_COPY due to overlapping TF-IDF terms. |
| 15 | `q_rec_4` | `M_RECURSION_NO_RETURN` | `M_ALIAS_COPY` | 0.85 | Model misclassified working text 'Dekho simple hai, Thinks returning a value in the ' as M_ALIAS_COPY due to overlapping TF-IDF terms. |
