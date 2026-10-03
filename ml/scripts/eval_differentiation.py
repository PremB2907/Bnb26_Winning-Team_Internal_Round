import json
import yaml
import numpy as np
from ml.relearn_ml.bayes import BayesianBeliefState
from ml.relearn_ml.selector import ActiveProbeSelector
from ml.relearn_ml.models import B6Hybrid

def evaluate_confusable_differentiation():
    with open("ml/data/taxonomy.yaml", "r") as f:
        taxonomy = yaml.safe_load(f)["misconceptions"]
    with open("ml/data/question_bank.yaml", "r") as f:
        question_bank = yaml.safe_load(f)["questions"]
    with open("ml/data/generated/dataset.json", "r") as f:
        dataset = json.load(f)

    # Top-5 Confusable Pairs from DATASET.md
    top_pairs = [
        ("M_OR_CHAIN", "M_FALSY_CONFUSION"),
        ("M_SCOPE_LEAK", "M_PRINT_IS_RETURN"),
        ("M_PRINT_IS_RETURN", "M_RECURSION_NO_RETURN"),
        ("M_ALIAS_COPY", "M_STR_MUTABLE"),
        ("M_ASSIGN_EQ", "M_FALSY_CONFUSION")
    ]

    train_data = [d for d in dataset if d["split"] == "train"]
    model = B6Hybrid(taxonomy, question_bank)
    model.fit(train_data, [d["label"] for d in train_data])
    selector = ActiveProbeSelector(question_bank)

    results = []

    print("\n================ TOP-5 CONFUSABLE PAIR DIFFERENTIATION EVALUATION ================")
    header = f"{'Confusable Pair':38s} | {'Final Ans Only':14s} | {'Working Text':12s} | {'+1 Probe':10s} | {'+2 Probes':10s}"
    print(header)
    print("-" * len(header))

    for m1, m2 in top_pairs:
        # Filter test items belonging to m1 or m2
        pair_data = [d for d in dataset if d["label"] in (m1, m2) and d["split"] in ("test_iid", "test_unseen_question", "test_unseen_style")]
        if not pair_data:
            continue

        acc_ans_only = 0
        acc_working = 0
        acc_probe1 = 0
        acc_probe2 = 0

        for item in pair_data:
            true_lbl = item["label"]
            q_id = item["question_id"]
            
            # 1. Final Answer Only: Predict based solely on outcome match
            acc_ans_only += 1 if random_choice_match(item, m1, m2, question_bank) == true_lbl else 0

            # 2. Working Text Only (classifier)
            clf_probs = model.b3.predict_proba(item)
            pred_clf = m1 if clf_probs.get(m1, 0) >= clf_probs.get(m2, 0) else m2
            acc_working += 1 if pred_clf == true_lbl else 0

            # Initialize Bayes
            bayes = BayesianBeliefState(taxonomy)
            # Prior constrained to pair
            bayes.posterior = {m: (0.5 if m in (m1, m2) else 0.0) for m in bayes.m_ids}

            # 3. +1 Probe Selection
            cand_probes = [q for q in question_bank if q["id"] != q_id and any(m in q.get("predictions", {}) for m in (m1, m2))]
            best_q1, _ = selector.select_best_probe(cand_probes, bayes.posterior)
            
            if best_q1:
                # Simulate learner response to probe 1
                pred_out1 = best_q1.get("predictions", {}).get(true_lbl, "UNKNOWN")
                outcome_agreed1 = {m: (1.0 if best_q1.get("predictions", {}).get(m) == pred_out1 else 0.1) for m in (m1, m2)}
                bayes.update(clf_probs, outcome_agreed1)

            pred_p1 = m1 if bayes.posterior.get(m1, 0) >= bayes.posterior.get(m2, 0) else m2
            acc_probe1 += 1 if pred_p1 == true_lbl else 0

            # 4. +2 Probes Selection
            if best_q1:
                cand_probes2 = [q for q in cand_probes if q["id"] != best_q1["id"]]
                best_q2, _ = selector.select_best_probe(cand_probes2, bayes.posterior)
                if best_q2:
                    pred_out2 = best_q2.get("predictions", {}).get(true_lbl, "UNKNOWN")
                    outcome_agreed2 = {m: (1.0 if best_q2.get("predictions", {}).get(m) == pred_out2 else 0.1) for m in (m1, m2)}
                    bayes.update(clf_probs, outcome_agreed2)

            pred_p2 = m1 if bayes.posterior.get(m1, 0) >= bayes.posterior.get(m2, 0) else m2
            acc_probe2 += 1 if pred_p2 == true_lbl else 0

        n = len(pair_data)
        a_ans = (acc_ans_only / n) * 100
        a_wrk = (acc_working / n) * 100
        a_p1 = (acc_probe1 / n) * 100
        a_p2 = (acc_probe2 / n) * 100

        pair_name = f"`{m1}` vs `{m2}`"
        print(f"{pair_name:38s} | {a_ans:13.1f}% | {a_wrk:11.1f}% | {a_p1:9.1f}% | {a_p2:9.1f}%")
        results.append({
            "pair": f"{m1}_vs_{m2}",
            "ans_only": a_ans,
            "working_text": a_wrk,
            "probe_1": a_p1,
            "probe_2": a_p2
        })

    with open("evaluation/results/differentiation_results.json", "w") as f:
        json.dump(results, f, indent=2)

def random_choice_match(item, m1, m2, q_bank):
    q_dict = {q["id"]: q for q in q_bank}
    q_id = item["question_id"]
    if q_id in q_dict:
        preds = q_dict[q_id].get("predictions", {})
        if preds.get(m1) == item["final_answer"] and preds.get(m2) != item["final_answer"]:
            return m1
        elif preds.get(m2) == item["final_answer"] and preds.get(m1) != item["final_answer"]:
            return m2
    return m1 if np.random.rand() > 0.5 else m2

if __name__ == "__main__":
    evaluate_confusable_differentiation()
