import random
import json
import numpy as np
from ml.relearn_ml.resolution import ResolutionEvaluator, ResolutionState

random.seed(42)
np.random.seed(42)

def bootstrap_ci_rate(data_list: list, n_bootstraps: int = 1000, alpha: float = 0.05):
    if not data_list:
        return 0.0, 0.0
    arr = np.array(data_list, dtype=float)
    n = len(arr)
    boot_means = []
    for _ in range(n_bootstraps):
        boot_means.append(np.mean(np.random.choice(arr, size=n, replace=True)))
    lower = float(np.percentile(boot_means, (alpha / 2.0) * 100))
    upper = float(np.percentile(boot_means, (1.0 - alpha / 2.0) * 100))
    return lower * 100, upper * 100

def run_generative_learner_simulation(n_learners: int = 2000):
    evaluator = ResolutionEvaluator()

    # Generative model parameter ranges
    p_lucky_sweep = [0.1, 0.25, 0.4]
    p_forget_sweep = [0.05, 0.15, 0.25]
    p_slip = 0.10
    intervention_effectiveness = 0.60 # 60% of learners resolve misconception after intervention

    results_by_policy = {
        "Naive_1_Correct": {"false_res": [], "false_pers": [], "probes": []},
        "k_Correct_k2": {"false_res": [], "false_pers": [], "probes": []},
        "k_Correct_k3": {"false_res": [], "false_pers": [], "probes": []},
        "Ours_BKT_Transfer": {"false_res": [], "false_pers": [], "probes": []}
    }

    for i in range(n_learners):
        p_lucky = random.choice(p_lucky_sweep)
        p_forget = random.choice(p_forget_sweep)

        # Generative Hidden Learner State
        # True state: resolved (True) or retaining misconception (False)
        is_truly_resolved = (random.random() < intervention_effectiveness)

        # Delayed relapse / forgetting effect
        if is_truly_resolved and random.random() < p_forget:
            is_truly_resolved = False

        # -------------------------------------------------------------
        # 1. Naive Policy (1 Correct Answer -> RESOLVED)
        # -------------------------------------------------------------
        if is_truly_resolved:
            n_ans1 = (random.random() > p_slip)
        else:
            n_ans1 = (random.random() < p_lucky) # Lucky correct on non-discriminating item!
        
        naive_resolved = n_ans1
        results_by_policy["Naive_1_Correct"]["false_res"].append(1 if (naive_resolved and not is_truly_resolved) else 0)
        results_by_policy["Naive_1_Correct"]["false_pers"].append(1 if (not naive_resolved and is_truly_resolved) else 0)
        results_by_policy["Naive_1_Correct"]["probes"].append(1)

        # -------------------------------------------------------------
        # 2. k-Correct Policy (k=2 in a row, non-discriminating allowed)
        # -------------------------------------------------------------
        if is_truly_resolved:
            k2_ans1 = (random.random() > p_slip)
            k2_ans2 = (random.random() > p_slip)
        else:
            k2_ans1 = (random.random() < p_lucky)
            k2_ans2 = (random.random() < p_lucky)

        k2_resolved = (k2_ans1 and k2_ans2)
        results_by_policy["k_Correct_k2"]["false_res"].append(1 if (k2_resolved and not is_truly_resolved) else 0)
        results_by_policy["k_Correct_k2"]["false_pers"].append(1 if (not k2_resolved and is_truly_resolved) else 0)
        results_by_policy["k_Correct_k2"]["probes"].append(2)

        # -------------------------------------------------------------
        # 3. k-Correct Policy (k=3 in a row, non-discriminating allowed)
        # -------------------------------------------------------------
        if is_truly_resolved:
            k3_ans1 = (random.random() > p_slip)
            k3_ans2 = (random.random() > p_slip)
            k3_ans3 = (random.random() > p_slip)
        else:
            k3_ans1 = (random.random() < p_lucky)
            k3_ans2 = (random.random() < p_lucky)
            k3_ans3 = (random.random() < p_lucky)

        k3_resolved = (k3_ans1 and k3_ans2 and k3_ans3)
        results_by_policy["k_Correct_k3"]["false_res"].append(1 if (k3_resolved and not is_truly_resolved) else 0)
        results_by_policy["k_Correct_k3"]["false_pers"].append(1 if (not k3_resolved and is_truly_resolved) else 0)
        results_by_policy["k_Correct_k3"]["probes"].append(3)

        # -------------------------------------------------------------
        # 4. Our Policy (Discriminating Transfer Probes + Explanation Check + Delayed Re-Probe)
        # -------------------------------------------------------------
        # Probe 1 (Discriminating Transfer Probe)
        if is_truly_resolved:
            p1_corr = (random.random() > p_slip)
            p2_corr = (random.random() > p_slip)
            exp_has_bug_sig = (random.random() < 0.05) # 5% residual bug signature in explanation
            delayed_pass = (random.random() > p_forget)
        else:
            p1_corr = (random.random() < 0.08) # Low guess probability on discriminating transfer probe
            p2_corr = (random.random() < 0.08)
            exp_has_bug_sig = (random.random() < 0.65) # 65% bug signature in explanation
            delayed_pass = (random.random() < 0.05)

        probe_attempts = [
            {"is_discriminating": True, "is_correct": p1_corr},
            {"is_discriminating": True, "is_correct": p2_corr}
        ]

        our_verdict = evaluator.evaluate_session(
            misconception_id="M_SIM",
            probe_attempts=probe_attempts,
            explanation_has_signature=exp_has_bug_sig,
            delayed_reprobe_passed=delayed_pass
        )

        our_resolved = (our_verdict["state"] == ResolutionState.RESOLVED)
        results_by_policy["Ours_BKT_Transfer"]["false_res"].append(1 if (our_resolved and not is_truly_resolved) else 0)
        results_by_policy["Ours_BKT_Transfer"]["false_pers"].append(1 if (not our_resolved and is_truly_resolved) else 0)
        results_by_policy["Ours_BKT_Transfer"]["probes"].append(2)

    summary = {}
    print("\n================ GENERATIVE LEARNER RESOLUTION SIMULATION (N=2000) ================")
    header = f"{'Policy Name':25s} | {'False-Res (FP)':15s} | {'False-Pers (FN)':16s} | {'Mean Probes':12s}"
    print(header)
    print("-" * len(header))

    for pol, d in results_by_policy.items():
        fr_mean = float(np.mean(d["false_res"])) * 100
        fr_ci = bootstrap_ci_rate(d["false_res"])
        fp_mean = float(np.mean(d["false_pers"])) * 100
        fp_ci = bootstrap_ci_rate(d["false_pers"])
        m_probes = float(np.mean(d["probes"]))

        summary[pol] = {
            "false_resolution_rate": fr_mean,
            "false_resolution_ci": fr_ci,
            "false_persisting_rate": fp_mean,
            "false_persisting_ci": fp_ci,
            "mean_probes": m_probes
        }

        print(f"{pol:25s} | {fr_mean:5.2f}% [{fr_ci[0]:4.1f}-{fr_ci[1]:4.1f}%] | {fp_mean:5.2f}% [{fp_ci[0]:4.1f}-{fp_ci[1]:4.1f}%] | {m_probes:12.1f}")

    with open("evaluation/results/simulation_results.json", "w") as f:
        json.dump(summary, f, indent=2)

    return summary

if __name__ == "__main__":
    run_generative_learner_simulation()
