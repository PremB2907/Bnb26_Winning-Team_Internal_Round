import yaml
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from ml.relearn_ml.models import B6Hybrid
from ml.relearn_ml.bayes import BayesianBeliefState
from ml.relearn_ml.selector import ActiveProbeSelector
from ml.relearn_ml.resolution import ResolutionEvaluator

app = FastAPI(title="Re:Learn ML Engine API")

# Load taxonomy, question bank, and dataset
with open("ml/data/taxonomy.yaml", "r") as f:
    taxonomy = yaml.safe_load(f)["misconceptions"]
with open("ml/data/question_bank.yaml", "r") as f:
    question_bank = yaml.safe_load(f)["questions"]
with open("ml/data/generated/dataset.json", "r") as f:
    dataset = json.load(f)

# Train B6 Hybrid model on startup
train_data = [d for d in dataset if d["split"] == "train"]
model = B6Hybrid(taxonomy, question_bank)
model.fit(train_data, [d["label"] for d in train_data])
selector = ActiveProbeSelector(question_bank)
resolution_evaluator = ResolutionEvaluator()

class DiagnoseRequest(BaseModel):
    question_id: str
    final_answer: str
    working_text: str
    code: Optional[str] = ""

class ProbeSelectRequest(BaseModel):
    current_posterior: Dict[str, float]
    excluded_question_ids: Optional[List[str]] = []

class UpdateBeliefRequest(BaseModel):
    current_posterior: Dict[str, float]
    classifier_probs: Dict[str, float]
    outcome_agreement: Optional[Dict[str, float]] = None

class InterventionRecommendRequest(BaseModel):
    misconception_id: str
    previous_interventions: Optional[List[str]] = []

@app.get("/health")
def health():
    return {"status": "ok", "misconceptions_loaded": len(taxonomy), "questions_loaded": len(question_bank)}

@app.post("/diagnose")
def diagnose(req: DiagnoseRequest):
    item = {
        "question_id": req.question_id,
        "final_answer": req.final_answer,
        "working_text": req.working_text,
        "code": req.code
    }
    # Predict probabilities
    clf_probs = model.b3.predict_proba(item)
    top_label, conf = model.predict(item)
    
    return {
        "predicted_label": top_label,
        "confidence": conf,
        "classifier_probs": clf_probs,
        "evidence_spans": [req.working_text[:40]] if req.working_text else []
    }

@app.post("/select-probe")
def select_probe(req: ProbeSelectRequest):
    cands = [q for q in question_bank if q["id"] not in req.excluded_question_ids]
    best_q, eig = selector.select_best_probe(cands, req.current_posterior)
    if not best_q:
        raise HTTPException(status_code=404, detail="No suitable probe question available")
    return {
        "probe_question": best_q,
        "expected_information_gain": eig
    }

@app.post("/update-belief")
def update_belief(req: UpdateBeliefRequest):
    bayes = BayesianBeliefState(taxonomy)
    bayes.posterior = dict(req.current_posterior)
    new_posterior = bayes.update(req.classifier_probs, req.outcome_agreement)
    return {
        "posterior": new_posterior,
        "entropy": bayes.get_entropy(new_posterior)
    }

@app.post("/recommend-intervention")
def recommend_intervention(req: InterventionRecommendRequest):
    types = ["micro-explanation", "counterexample", "worked-example", "predict-then-run"]
    untried = [t for t in types if t not in req.previous_interventions]
    selected_type = untried[0] if untried else types[0]
    
    # Grounded intervention generator
    tax_dict = {m["id"]: m for m in taxonomy}
    m_info = tax_dict.get(req.misconception_id, {"correct_model": "Standard Python semantics", "bug_model": "Buggy mental model"})
    
    return {
        "intervention_type": selected_type,
        "content": f"Correct Model: {m_info['correct_model']}. Contrast with: {m_info['bug_model']}",
        "rationale": f"Selected untried intervention type '{selected_type}' to target misconception '{req.misconception_id}'."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
