import random
import json
import numpy as np
from ml.relearn_ml.resolution import ResolutionEvaluator, ResolutionState

random.seed(42)

def run_simulation(n_learners=500, p_lucky_range=(0.1, 0.4)):
    evaluator = ResolutionEvaluator()

    naive_false_resolutions = 0
    our_false_resolutions = 0
    our_false_persisting = 0
    our_probe_counts = []

    for learner_id in range(n_learners):
        p_lucky = random.uniform(*p_lucky_range)
        # True ground state: Learner genuinely has misconception (True) or resolved it after intervention (False)
        # Assume 40% of learners actually resolve after intervention, 60% retain misconception
        truly_resolved = (random.random() < 0.40)

        # 1. Naive Policy Simulation (Single follow-up question)
        # Non-discriminating question where lucky correct chance applies
        if truly_resolved:
            naive_correct = (random.random() > 0.1) # 90% chance correct
        else:
            naive_correct = (random.random() < p_lucky) # Lucky correct!

        naive_verdict_resolved = naive_correct
        if naive_verdict_resolved and not truly_resolved:
            naive_false_resolutions += 1

        # 2. Our Policy Simulation (Multi-probe sequence with discriminating transfer probes & explanation check)
        probe_attempts = []
        # Probe 1 (Discriminating)
        if truly_resolved:
            p1_correct = (random.random() > 0.1)
        else:
            p1_correct = (random.random() < 0.05) # Low lucky chance on discriminating probe!
        probe_attempts.append({"is_discriminating": True, "is_correct": p1_correct})

        # Probe 2 (Transfer Probe)
        if truly_resolved:
            p2_correct = (random.random() > 0.1)
        else:
            p2_correct = (random.random() < 0.05)
        probe_attempts.append({"is_discriminating": True, "is_correct": p2_correct})

        # Explanation check signature presence
        explanation_sig = False if truly_resolved else (random.random() < 0.70)
        delayed_reprobe = True if truly_resolved else (random.random() < 0.05)

        our_verdict = evaluator.evaluate_session(
            misconception_id="M_SIM",
            probe_attempts=probe_attempts,
            explanation_has_signature=explanation_sig,
            delayed_reprobe_passed=delayed_reprobe
        )

        our_probe_counts.append(len(probe_attempts))
        our_is_resolved = (our_verdict["state"] == ResolutionState.RESOLVED)

        if our_is_resolved and not truly_resolved:
            our_false_resolutions += 1
        elif not our_is_resolved and truly_resolved:
            our_false_persisting += 1

    naive_false_res_rate = (naive_false_resolutions / n_learners) * 100
    our_false_res_rate = (our_false_resolutions / n_learners) * 100
    our_false_pers_rate = (our_false_persisting / n_learners) * 100
    mean_probes = np.mean(our_probe_counts)

    print("\n================ LEARNER RESOLUTION SIMULATION RESULTS (N=500) ================")
    print(f"Naive Policy False-Resolution Rate (False Positives): {naive_false_res_rate:.2f}%")
    print(f"Our Policy False-Resolution Rate (False Positives)  : {our_false_res_rate:.2f}%")
    print(f"Our Policy False-Persisting Rate (False Negatives)  : {our_false_pers_rate:.2f}%")
    print(f"Mean Probes to Decision                            : {mean_probes:.1f}")

    results = {
        "n_learners": n_learners,
        "naive_false_resolution_rate": naive_false_res_rate,
        "our_false_resolution_rate": our_false_res_rate,
        "our_false_persisting_rate": our_false_pers_rate,
        "mean_probes": mean_probes
    }

    with open("evaluation/results/simulation_results.json", "w") as f:
        json.dump(results, f, indent=2)

    return results

if __name__ == "__main__":
    run_simulation()
