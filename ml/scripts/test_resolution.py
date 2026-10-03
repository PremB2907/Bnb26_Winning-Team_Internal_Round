from ml.relearn_ml.resolution import ResolutionEvaluator, ResolutionState

def test_resolution_state_machine():
    print("--- RUNNING RESOLUTION STATE MACHINE UNIT TESTS ---")
    evaluator = ResolutionEvaluator()

    # Case 1: Single non-discriminating correct answer (Naive approach would say RESOLVED, ours says PARTIAL/ACTIVE)
    res1 = evaluator.evaluate_session(
        misconception_id="M_ALIAS_COPY",
        probe_attempts=[{"is_discriminating": False, "is_correct": True}],
        explanation_has_signature=False,
        delayed_reprobe_passed=False
    )
    print(f"Case 1 (1 Non-discriminating correct): State={res1['state']}, p_resolved={res1['p_resolved']:.2f}")
    assert res1["state"] != ResolutionState.RESOLVED, "Failed: Non-discriminating answer must NOT yield RESOLVED!"

    # Case 2: Correct answer but explanation has misconception signature
    res2 = evaluator.evaluate_session(
        misconception_id="M_ALIAS_COPY",
        probe_attempts=[{"is_discriminating": True, "is_correct": True}],
        explanation_has_signature=True,
        delayed_reprobe_passed=True
    )
    print(f"Case 2 (Correct answer + bug signature in explanation): State={res2['state']}, p_resolved={res2['p_resolved']:.2f}")
    assert res2["state"] == ResolutionState.PERSISTING, "Failed: Explanation signature must force PERSISTING state!"

    # Case 3: Fully resolved (2 discriminating transfer probes + clean explanation + delayed re-probe)
    res3 = evaluator.evaluate_session(
        misconception_id="M_ALIAS_COPY",
        probe_attempts=[
            {"is_discriminating": True, "is_correct": True},
            {"is_discriminating": True, "is_correct": True}
        ],
        explanation_has_signature=False,
        delayed_reprobe_passed=True
    )
    print(f"Case 3 (2 Discriminating probes + delayed pass): State={res3['state']}, p_resolved={res3['p_resolved']:.2f}")
    assert res3["state"] == ResolutionState.RESOLVED, "Failed: Should be RESOLVED!"

    print("ALL RESOLUTION STATE MACHINE UNIT TESTS PASSED GREEN!")

if __name__ == "__main__":
    test_resolution_state_machine()
