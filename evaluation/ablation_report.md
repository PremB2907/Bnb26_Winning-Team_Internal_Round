# Ablation Study Results

| Strategy | Accuracy | Precision | Recall |
|----------|----------|-----------|--------|
| A: Exact Deterministic Matching | 89.1% | 97.8% | 100.0% |
| B: Candidate Scoring | 89.1% | 97.8% | 100.0% |
| C: Candidate Scoring + Discriminating Questions | 98.2% | 97.8% | 100.0% |

**Conclusion**: Strategy C correctly flags 5 cases as AMBIGUOUS to trigger discriminating questions, raising overall accuracy compared to blindly picking a candidate.
