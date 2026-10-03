import numpy as np
import yaml
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import FeatureUnion
from ml.relearn_ml.ast_features import PythonASTExtractor
from ml.relearn_ml.llm_adjudicator import LLMAdjudicator

class B0Rules:
    """Old Substring Trigger Matcher Baseline."""
    def __init__(self, taxonomy):
        self.tax_dict = {m["id"]: m for m in taxonomy}

    def predict(self, item):
        wrk = item["working_text"].lower()
        for m_id, m in self.tax_dict.items():
            for sf in m.get("common_surface_forms", []):
                if sf.lower() in wrk:
                    return m_id, 0.8
        return "OTHER_UNKNOWN", 0.3

class B1AnswerOnly:
    """Classifier on final_answer + question_id features only."""
    def __init__ (self):
        self.clf = LogisticRegression(max_iter=500)
        self.vec = TfidfVectorizer(token_pattern=r"(?u)\b\w+\b")

    def fit(self, X, y):
        texts = [f"{x['question_id']} {x['final_answer']}" for x in X]
        feats = self.vec.fit_transform(texts)
        self.clf.fit(feats, y)

    def predict_proba(self, item):
        text = f"{item['question_id']} {item['final_answer']}"
        feat = self.vec.transform([text])
        probs = self.clf.predict_proba(feat)[0]
        return dict(zip(self.clf.classes_, probs))

class B2TfidfText:
    """Char + Word TF-IDF + Logistic Regression on working text."""
    def __init__(self):
        self.clf = LogisticRegression(max_iter=500)
        self.vec = TfidfVectorizer(ngram_range=(1, 3), analyzer="word")

    def fit(self, X, y):
        texts = [x["working_text"] for x in X]
        feats = self.vec.fit_transform(texts)
        self.clf.fit(feats, y)

    def predict_proba(self, item):
        feat = self.vec.transform([item["working_text"]])
        probs = self.clf.predict_proba(feat)[0]
        return dict(zip(self.clf.classes_, probs))

class B3CodeAware:
    """AST code features + Text TF-IDF + Logistic Regression."""
    def __init__(self):
        self.clf = LogisticRegression(max_iter=500)
        self.vec = TfidfVectorizer(ngram_range=(1, 2))

    def fit(self, X, y):
        texts = [x["working_text"] for x in X]
        text_feats = self.vec.fit_transform(texts).toarray()
        ast_feats = np.array([[v for v in PythonASTExtractor.extract_features(x.get("code", "")).values()] for x in X])
        combined = np.hstack([text_feats, ast_feats])
        self.clf.fit(combined, y)

    def predict_proba(self, item):
        text_feat = self.vec.transform([item["working_text"]]).toarray()
        ast_feat = np.array([[v for v in PythonASTExtractor.extract_features(item.get("code", "")).values()]])
        combined = np.hstack([text_feat, ast_feat])
        probs = self.clf.predict_proba(combined)[0]
        return dict(zip(self.clf.classes_, probs))

class B6Hybrid:
    """Final Calibrated Hybrid with Outcome Agreement & Novelty Abstention."""
    def __init__(self, taxonomy, question_bank):
        self.b3 = B3CodeAware()
        self.llm = LLMAdjudicator()
        self.tax_dict = {m["id"]: m for m in taxonomy}
        self.q_dict = {q["id"]: q for q in question_bank}
        self.abstain_threshold = 0.40

    def fit(self, X, y):
        self.b3.fit(X, y)

    def predict(self, item):
        b3_probs = self.b3.predict_proba(item)
        sorted_cands = sorted(b3_probs.items(), key=lambda x: x[1], reverse=True)
        top_lbl, top_prob = sorted_cands[0]
        margin = top_prob - (sorted_cands[1][1] if len(sorted_cands) > 1 else 0.0)

        # Check outcome map agreement if item in question bank
        q_id = item["question_id"]
        outcome_agreement = 1.0
        if q_id in self.q_dict:
            preds = self.q_dict[q_id].get("predictions", {})
            if top_lbl in preds:
                expected_ans = str(preds[top_lbl])
                actual_ans = str(item["final_answer"])
                if expected_ans != actual_ans:
                    outcome_agreement = 0.2

        calibrated_conf = top_prob * outcome_agreement

        # Abstain / Flag Novelty if confidence is too low
        if calibrated_conf < self.abstain_threshold:
            # Call LLM adjudicator for ambiguous cases
            top_k = [{"id": k, "bug_model": self.tax_dict[k]["bug_model"]} for k, p in sorted_cands[:3] if k in self.tax_dict]
            q_prompt = self.q_dict[q_id]["prompt"] if q_id in self.q_dict else "Code question"
            llm_res = self.llm.adjudicate(q_prompt, item["working_text"], top_k)
            if llm_res.get("status") == "SUCCESS" and "predicted_label" in llm_res:
                return llm_res["predicted_label"], llm_res.get("confidence", 0.5)
            # Fall back to classifier top prediction if LLM is UNAVAILABLE
            return top_lbl, calibrated_conf

        return top_lbl, calibrated_conf
