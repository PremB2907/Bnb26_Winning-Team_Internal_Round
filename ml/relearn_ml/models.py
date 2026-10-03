import numpy as np
import yaml
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.decomposition import TruncatedSVD
from ml.relearn_ml.ast_features import PythonASTExtractor
from ml.relearn_ml.llm_adjudicator import LLMAdjudicator
from ml.relearn_ml.calibration import ProbabilityCalibrator

class B0Rules:
    """Independent Frozen Surface Form Rule Matcher."""
    def __init__(self, taxonomy):
        self.tax_dict = {m["id"]: m for m in taxonomy}

    def predict(self, item):
        wrk = item["working_text"].lower()
        for m_id, m in self.tax_dict.items():
            for sf in m.get("common_surface_forms", []):
                if sf.lower() in wrk:
                    return m_id, 0.85
        return "OTHER_UNKNOWN", 0.30

class B1AnswerOnly:
    """Classifier on final_answer + question_id features only."""
    def __init__(self):
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
    """AST code features extracted strictly from learner_code + Text TF-IDF + LR."""
    def __init__(self):
        self.clf = LogisticRegression(max_iter=500)
        self.vec = TfidfVectorizer(ngram_range=(1, 2))

    def fit(self, X, y):
        texts = [x["working_text"] for x in X]
        text_feats = self.vec.fit_transform(texts).toarray()
        ast_feats = np.array([[v for v in PythonASTExtractor.extract_features(x.get("learner_code", "")).values()] for x in X])
        combined = np.hstack([text_feats, ast_feats])
        self.clf.fit(combined, y)

    def predict_proba(self, item):
        text_feat = self.vec.transform([item["working_text"]]).toarray()
        ast_feat = np.array([[v for v in PythonASTExtractor.extract_features(item.get("learner_code", "")).values()]])
        combined = np.hstack([text_feat, ast_feat])
        probs = self.clf.predict_proba(combined)[0]
        return dict(zip(self.clf.classes_, probs))

class B4DenseEmbedder:
    """Dense SVD Embeddings + Logistic Regression Head."""
    def __init__(self):
        self.vec = TfidfVectorizer(ngram_range=(1, 3))
        self.svd = TruncatedSVD(n_components=50, random_state=42)
        self.clf = LogisticRegression(max_iter=500)

    def fit(self, X, y):
        texts = [x["working_text"] for x in X]
        tfidf = self.vec.fit_transform(texts)
        n_comp = min(50, tfidf.shape[1] - 1)
        if n_comp > 1:
            self.svd = TruncatedSVD(n_components=n_comp, random_state=42)
            dense = self.svd.fit_transform(tfidf)
        else:
            dense = tfidf.toarray()
        self.clf.fit(dense, y)

    def predict_proba(self, item):
        tfidf = self.vec.transform([item["working_text"]])
        dense = self.svd.transform(tfidf) if hasattr(self.svd, "components_") else tfidf.toarray()
        probs = self.clf.predict_proba(dense)[0]
        return dict(zip(self.clf.classes_, probs))

class B6Hybrid:
    """Final Calibrated Hybrid with Outcome Map Agreement & Isotonic Calibration."""
    def __init__(self, taxonomy, question_bank):
        self.b3 = B3CodeAware()
        self.llm = LLMAdjudicator()
        self.calibrator = ProbabilityCalibrator()
        self.tax_dict = {m["id"]: m for m in taxonomy}
        self.q_dict = {q["id"]: q for q in question_bank}
        self.abstain_threshold = 0.35

    def fit(self, X, y, X_val=None, y_val=None):
        self.b3.fit(X, y)
        if X_val and y_val:
            val_probs = np.array([[self.b3.predict_proba(item).get(c, 0.0) for c in self.b3.clf.classes_] for item in X_val])
            self.calibrator.fit(val_probs, y_val, list(self.b3.clf.classes_))

    def predict(self, item):
        b3_probs = self.b3.predict_proba(item)
        q_id = item["question_id"]
        actual_ans = str(item["final_answer"]).strip()

        # Outcome map agreement directly modifies posterior likelihood
        adjusted_probs = {}
        for m_id, p in b3_probs.items():
            outcome_multiplier = 1.0
            if q_id in self.q_dict:
                preds = self.q_dict[q_id].get("predictions", {})
                if m_id in preds:
                    exp_ans = str(preds[m_id]).strip()
                    outcome_multiplier = 1.0 if exp_ans == actual_ans else 0.1
            adjusted_probs[m_id] = p * outcome_multiplier

        # Normalize
        total = sum(adjusted_probs.values())
        if total > 0:
            adjusted_probs = {k: v / total for k, v in adjusted_probs.items()}

        sorted_cands = sorted(adjusted_probs.items(), key=lambda x: x[1], reverse=True)
        top_lbl, uncal_conf = sorted_cands[0]
        cal_conf = self.calibrator.calibrate(top_lbl, uncal_conf)

        if cal_conf < self.abstain_threshold:
            top_k = [{"id": k, "bug_model": self.tax_dict[k]["bug_model"]} for k, p in sorted_cands[:3] if k in self.tax_dict]
            q_prompt = self.q_dict[q_id]["prompt"] if q_id in self.q_dict else "Code question"
            llm_res = self.llm.adjudicate(q_prompt, item["working_text"], top_k)
            if llm_res.get("status") == "SUCCESS" and "predicted_label" in llm_res:
                return llm_res["predicted_label"], llm_res.get("confidence", 0.5)

        return top_lbl, cal_conf
