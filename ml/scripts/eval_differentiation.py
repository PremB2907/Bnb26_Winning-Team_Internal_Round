import json
import yaml
import random
import numpy as np
from ml.relearn_ml.bayes import BayesianBeliefState
from ml.relearn_ml.selector import ActiveProbeSelector
from ml.relearn_ml.models import B6Hybrid

random.seed(42)
np.random.seed(42)

def simulate_noisy_learner_response(question, true_m_id: str, noise_epsilon: float) -> str:
    preds = question.get("predictions", {})
    expected_y = str(preds.get(true_m_id, "CORRECT_OR_UNKNOWN"))
    
    # Slip / guess noise
    if random.random() < noise_epsilon:
        # Off-map or alternative answer
        other_outputs = [str(v) for k, v in preds.items() if str(v) != expected_y]
        return random.choice(other_outputs) if other_outputs else "GUESS_NOISE"
    return expected_y

def evaluate_non_oracle_differentiation():
    with open("ml/data/taxonomy.yaml", "r") as f:
        taxonomy = yaml.safe_load(f)["misconceptions"]
    with open("ml/data/question_bank.yaml", "r") as f:
        question_bank = yaml.safe_load(f)["questions"]
    with open("ml/data/generated/dataset.json", "r") as f:
        dataset = json.load(f)

    train_data = [d for d in dataset if d["split"] == "train"]
    val_data = [d for d in dataset if d["split"] == "val"]
    test_data = [d for d in dataset if d["split"] in ("test_iid", "test_unseen_question", "test_unseen_style")]

    model = B6Hybrid(taxonomy, question_bank)
    model.fit(train_data, [d["label"] for d in train_data], val_data, [d["label"] for d in val_data])
    selector = ActiveProbeSelector(question_bank)

    epsilon_levels = [0.0, 0.1, 0.2, 0.3]
    differentiation_results = []

    print("\n================ NON-ORACLE PROBE DIFFERENTIATION BENCHMARK ================")

    for eps in epsilon_levels:
        print(f"\n--- Noise Level Epsilon = {eps:.1f} ---")
        
        # Probe strategies: EIG-Selected, Random-Probe, Fixed-Probe
        strategies = ["EIG_Selected", "Random_Probe", "Fixed_Probe"]
        eps_res = {"epsilon": eps, "strategies": {}}

        for strat in strategies:
            accs = {0: 0, 1: 0, 2: 0, 3: 0}
            total = len(test_data)

            for item in test_data:
                true_lbl = item["label"]
                clf_probs = model.b3.predict_proba(item)

                bayes = BayesianBeliefState(taxonomy)
                bayes.update(clf_probs)

                # 0 Probes (Baseline Classifier)
                pred0 = max(bayes.posterior, key=bayes.posterior.get)
                accs[0] += 1 if pred0 == true_lbl else 0

                used_q_ids = [item["question_id"]]

                # Probes 1 to 3
                for k_probe in range(1, 4):
                    cands = [q for q in question_bank if q["id"] not in used_q_ids]
                    if not cands:
                        break

                    if strat == "EIG_Selected":
                        probe_q, _ = selector.select_best_probe(cands, bayes.posterior)
                    elif strat == "Random_Probe":
                        probe_q = random.choice(cands)
                    elif strat == "Fixed_Probe":
                        probe_q = cands[0]

                    if not probe_q:
                        break

                    used_q_ids.append(probe_q["id"])

                    # Simulate Noisy Learner Answer to probe (NO ORACLE)
                    observed_y = simulate_noisy_learner_response(probe_q, true_lbl, noise_epsilon=eps)

                    # Outcome agreement dictionary
                    outcome_agreed = {}
                    preds = probe_q.get("predictions", {})
                    for m in bayes.m_ids:
                        outcome_agreed[m] = 1.0 if str(preds.get(m)).strip() == observed_y.strip() else 0.1

                    # Bayesian Update with observed noisy answer
                    bayes.update(clf_probs, outcome_agreed)
                    pred_k = max(bayes.posterior, key=bayes.posterior.get)
                    accs[k_probe] += 1 if pred_k == true_lbl else 0

            eps_res["strategies"][strat] = {k: (v / total) * 100 for k, v in accs.items()}
            print(f"Strategy {strat:15s} | 0 Probes: {accs[0]/total*100:5.1f}% | +1 Probe: {accs[1]/total*100:5.1f}% | +2 Probes: {accs[2]/total*100:5.1f}% | +3 Probes: {accs[3]/total*100:5.1f}%")

        differentiation_results.append(eps_res)

    with open("evaluation/results/differentiation_results.json", "w") as f:
        json.dump(differentiation_results, f, indent=2)

    print("\nDifferentiation results saved to evaluation/results/differentiation_results.json")

if __name__ == "__main__":
    evaluate_non_oracle_differentiation()
