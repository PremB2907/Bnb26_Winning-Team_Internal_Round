import sys
import numpy as np
from ml.relearn_ml.bayes import BayesianBeliefState
from ml.relearn_ml.selector import ActiveProbeSelector

def test_toy_case():
    print("--- RUNNING EIG & BAYES UNIT TESTS ---")

    taxonomy = [
        {"id": "M1"}, {"id": "M2"}, {"id": "M3"}
    ]
    bayes = BayesianBeliefState(taxonomy)
    selector = ActiveProbeSelector([])

    # Toy Question 1: All candidates predict "Output_A" (Zero EIG)
    q_non_discrim = {
        "id": "q_nondiscrim",
        "predictions": {"M1": "Output_A", "M2": "Output_A", "M3": "Output_A"}
    }

    # Toy Question 2: Divergent predictions (High EIG)
    q_discrim = {
        "id": "q_discrim",
        "predictions": {"M1": "Output_A", "M2": "Output_B", "M3": "Output_C"}
    }

    eig_zero = selector.compute_eig(q_non_discrim, bayes.posterior)
    eig_high = selector.compute_eig(q_discrim, bayes.posterior)

    print(f"Non-discriminating EIG: {eig_zero:.4f} (Expected: 0.0000)")
    print(f"Divergent Discriminating EIG: {eig_high:.4f} (Expected: ~1.5850)")

    assert abs(eig_zero - 0.0) < 1e-5, "Failed: Non-discriminating question must have 0 EIG!"
    assert eig_high > 1.5, "Failed: Divergent question must have high EIG!"

    # Test Bayesian Posterior Update given outcome match for M2
    outcome_agreement = {"M1": 0.1, "M2": 1.0, "M3": 0.1}
    classifier_probs = {"M1": 0.2, "M2": 0.6, "M3": 0.2}

    updated_post = bayes.update(classifier_probs, outcome_agreement)
    print(f"Updated Posterior after outcome match for M2: {updated_post}")
    
    assert updated_post["M2"] > 0.8, "Failed: Posterior for M2 should dominate after match!"
    print("ALL EIG & BAYES UNIT TESTS PASSED GREEN!")

if __name__ == "__main__":
    test_toy_case()
