class ResolutionState:
    ACTIVE = "ACTIVE"
    INTERVENED = "INTERVENED"
    PROBING = "PROBING"
    RESOLVED = "RESOLVED"
    PARTIAL = "PARTIAL"
    PERSISTING = "PERSISTING"

class ResolutionEvaluator:
    """
    BKT-style Resolution Assessment Engine.
    Does NOT trust a single correct follow-up answer.
    Requires >=2 discriminating transfer probes + explanation check + delayed re-probe.
    """

    def __init__(self, p_init=0.1, p_transit=0.25, p_slip=0.1, p_guess_nondiscrim=0.5, p_guess_discrim=0.1):
        self.p_init = p_init
        self.p_transit = p_transit
        self.p_slip = p_slip
        self.p_guess_nondiscrim = p_guess_nondiscrim
        self.p_guess_discrim = p_guess_discrim

    def evaluate_session(self, misconception_id: str, probe_attempts: list, explanation_has_signature: bool, delayed_reprobe_passed: bool) -> dict:
        """
        probe_attempts: list of dicts {"is_discriminating": bool, "is_correct": bool}
        """
        p_resolved = self.p_init
        discriminating_passed = 0

        for attempt in probe_attempts:
            is_discrim = attempt.get("is_discriminating", False)
            is_correct = attempt.get("is_correct", False)

            p_guess = self.p_guess_discrim if is_discrim else self.p_guess_nondiscrim

            if not is_discrim:
                # Non-discriminating items provide ZERO information on actual resolution
                continue

            if is_correct:
                discriminating_passed += 1
                # Bayes update for P(Learned | Correct)
                num = p_resolved * (1.0 - self.p_slip)
                den = num + (1.0 - p_resolved) * p_guess
                p_resolved = num / den if den > 0 else p_resolved
            else:
                # Incorrect on discriminating probe -> misconception is persisting
                num = p_resolved * self.p_slip
                den = num + (1.0 - p_resolved) * (1.0 - p_guess)
                p_resolved = num / den if den > 0 else p_resolved

        # Check explanation signature
        if explanation_has_signature:
            # Reappearance of bug model signature in explanation overrides correct answer
            return {
                "state": ResolutionState.PERSISTING,
                "p_resolved": min(0.1, p_resolved),
                "discriminating_passed": discriminating_passed,
                "reason": "Misconception signature detected in explanation text despite correct answer."
            }

        # Decision rules
        if discriminating_passed >= 2 and delayed_reprobe_passed and p_resolved >= 0.85:
            state = ResolutionState.RESOLVED
        elif discriminating_passed >= 1 or p_resolved >= 0.5:
            state = ResolutionState.PARTIAL
        else:
            state = ResolutionState.PERSISTING

        return {
            "state": state,
            "p_resolved": p_resolved,
            "discriminating_passed": discriminating_passed,
            "reason": f"Passed {discriminating_passed} discriminating probes with p_resolved={p_resolved:.2f}."
        }
