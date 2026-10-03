import numpy as np

class BayesianBeliefState:
    """Maintains P(M | evidence) over candidate misconceptions per learner."""

    def __init__(self, taxonomy):
        self.m_ids = [m["id"] for m in taxonomy]
        # Uniform prior or population frequency
        n = len(self.m_ids)
        self.prior = {m_id: 1.0 / n for m_id in self.m_ids}
        self.posterior = dict(self.prior)

    def update(self, classifier_probs: dict, outcome_agreement: dict = None):
        """
        Bayes rule: P(M | e) ~ P(e | M) * P(M)
        classifier_probs: dict of P(e_text | M) from classifier
        outcome_agreement: dict of outcome match (1.0 if predicted output matches observed answer, else 0.1)
        """
        unnormalized = {}
        for m_id in self.m_ids:
            p_text = classifier_probs.get(m_id, 0.01)
            p_outcome = outcome_agreement.get(m_id, 1.0) if outcome_agreement else 1.0
            
            likelihood = p_text * p_outcome
            unnormalized[m_id] = likelihood * self.posterior[m_id]

        total = sum(unnormalized.values())
        if total > 0:
            self.posterior = {m: v / total for m, v in unnormalized.items()}
        return self.posterior

    def get_entropy(self, belief_dict=None):
        probs = np.array(list((belief_dict or self.posterior).values()))
        probs = probs[probs > 0]
        return -np.sum(probs * np.log2(probs))
