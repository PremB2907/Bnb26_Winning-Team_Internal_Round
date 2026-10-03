import numpy as np

class ActiveProbeSelector:
    """Selects probe question maximizing Expected Information Gain (EIG)."""

    def __init__(self, question_bank):
        self.question_bank = question_bank

    def compute_eig(self, question, current_posterior: dict) -> float:
        preds = question.get("predictions", {})
        if not preds:
            return 0.0

        # Calculate current entropy H(P(M))
        probs = np.array([p for p in current_posterior.values() if p > 0])
        current_h = -np.sum(probs * np.log2(probs))

        # Partition posterior by predicted outcome y
        outcome_groups = {}
        for m_id, p_m in current_posterior.items():
            if p_m <= 0:
                continue
            y = preds.get(m_id, "CORRECT_OR_UNKNOWN")
            outcome_groups[y] = outcome_groups.get(y, 0.0) + p_m

        # If all candidates predict the exact same outcome, EIG is zero
        if len(outcome_groups) <= 1:
            return 0.0

        # Expected conditional entropy sum_y P(y|Q) H(P(M | Q, y))
        expected_h = 0.0
        for y, p_y in outcome_groups.items():
            # Posterior given outcome y
            p_m_given_y = []
            for m_id, p_m in current_posterior.items():
                if preds.get(m_id, "CORRECT_OR_UNKNOWN") == y:
                    p_m_given_y.append(p_m / p_y)
            
            p_m_given_y = np.array([p for p in p_m_given_y if p > 0])
            h_y = -np.sum(p_m_given_y * np.log2(p_m_given_y))
            expected_h += p_y * h_y

        eig = current_h - expected_h
        return max(0.0, eig)

    def select_best_probe(self, candidate_questions: list, current_posterior: dict):
        best_q = None
        best_eig = -1.0
        
        for q in candidate_questions:
            eig = self.compute_eig(q, current_posterior)
            if eig > best_eig:
                best_eig = eig
                best_q = q

        return best_q, best_eig
