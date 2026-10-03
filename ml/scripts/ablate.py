import json
import yaml
import numpy as np
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from ml.relearn_ml.models import B2TfidfText, B3CodeAware, B6Hybrid

def load_data():
    with open("ml/data/taxonomy.yaml", "r") as f:
        taxonomy = yaml.safe_load(f)["misconceptions"]
    with open("ml/data/question_bank.yaml", "r") as f:
        question_bank = yaml.safe_load(f)["questions"]
    with open("ml/data/generated/dataset.json", "r") as f:
        dataset = json.load(f)
    return taxonomy, question_bank, dataset

def run_ablation():
    taxonomy, question_bank, dataset = load_data()
    train_data = [d for d in dataset if d["split"] == "train"]
    test_data = [d for d in dataset if d["split"] == "test_unseen_question"]

    y_true = [d["label"] for d in test_data]
    y_train = [d["label"] for d in train_data]

    # Full B6 Hybrid Model
    b6_full = B6Hybrid(taxonomy, question_bank)
    b6_full.fit(train_data, y_train)

    ablation_results = []

    # 1. Full Model (B6)
    preds_full = [b6_full.predict(item)[0] for item in test_data]
    acc_full = accuracy_score(y_true, preds_full)
    f1_full = precision_recall_fscore_support(y_true, preds_full, average="macro", zero_division=0)[2]
    ablation_results.append({
        "component_removed": "None (Full B6 Hybrid)",
        "accuracy": acc_full,
        "f1": f1_full,
        "delta_acc": 0.0
    })

    # 2. Remove Outcome Map Agreement (Pure B3 Classifier)
    preds_no_outcome = []
    for item in test_data:
        probs = b6_full.b3.predict_proba(item)
        top_lbl = max(probs, key=probs.get)
        preds_no_outcome.append(top_lbl)
    acc_no_outcome = accuracy_score(y_true, preds_no_outcome)
    f1_no_outcome = precision_recall_fscore_support(y_true, preds_no_outcome, average="macro", zero_division=0)[2]
    ablation_results.append({
        "component_removed": "Outcome Map Agreement",
        "accuracy": acc_no_outcome,
        "f1": f1_no_outcome,
        "delta_acc": (acc_no_outcome - acc_full) * 100
    })

    # 3. Remove AST Features (Pure Text B2 Model)
    b2_text = B2TfidfText()
    b2_text.fit(train_data, y_train)
    preds_no_ast = []
    for item in test_data:
        probs = b2_text.predict_proba(item)
        top_lbl = max(probs, key=probs.get)
        preds_no_ast.append(top_lbl)
    acc_no_ast = accuracy_score(y_true, preds_no_ast)
    f1_no_ast = precision_recall_fscore_support(y_true, preds_no_ast, average="macro", zero_division=0)[2]
    ablation_results.append({
        "component_removed": "AST Code Features",
        "accuracy": acc_no_ast,
        "f1": f1_no_ast,
        "delta_acc": (acc_no_ast - acc_full) * 100
    })

    # 4. Remove LLM Grounded Adjudicator
    preds_no_llm = [max(b6_full.b3.predict_proba(item), key=b6_full.b3.predict_proba(item).get) for item in test_data]
    acc_no_llm = accuracy_score(y_true, preds_no_llm)
    f1_no_llm = precision_recall_fscore_support(y_true, preds_no_llm, average="macro", zero_division=0)[2]
    ablation_results.append({
        "component_removed": "LLM Grounded Adjudicator",
        "accuracy": acc_no_llm,
        "f1": f1_no_llm,
        "delta_acc": (acc_no_llm - acc_full) * 100
    })

    print("\n================ COMPONENT ABLATION STUDY RESULTS (test_unseen_question) ================")
    header = f"{'Component Removed':32s} | {'Accuracy':8s} | {'Macro-F1':8s} | {'Delta Acc':10s}"
    print(header)
    print("-" * len(header))
    for r in ablation_results:
        print(f"{r['component_removed']:32s} | {r['accuracy']*100:7.2f}% | {r['f1']*100:7.2f}% | {r['delta_acc']:+9.2f}%")

    with open("evaluation/results/ablation_results.json", "w") as f:
        json.dump(ablation_results, f, indent=2)

    return ablation_results

if __name__ == "__main__":
    run_ablation()
