import json
import yaml
import numpy as np
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, roc_auc_score
from ml.relearn_ml.models import B0Rules, B1AnswerOnly, B2TfidfText, B3CodeAware, B6Hybrid

def load_all():
    with open("ml/data/taxonomy.yaml", "r") as f:
        taxonomy = yaml.safe_load(f)["misconceptions"]
    with open("ml/data/question_bank.yaml", "r") as f:
        question_bank = yaml.safe_load(f)["questions"]
    with open("ml/data/generated/dataset.json", "r") as f:
        dataset = json.load(f)
    return taxonomy, question_bank, dataset

def eval_model_split(model, test_data, is_probabilistic=True):
    y_true = [d["label"] for d in test_data]
    y_pred = []
    y_conf = []

    for item in test_data:
        if hasattr(model, "predict"):
            lbl, conf = model.predict(item)
            y_pred.append(lbl)
            y_conf.append(conf)
        elif hasattr(model, "predict_proba"):
            probs = model.predict_proba(item)
            lbl = max(probs, key=probs.get)
            y_pred.append(lbl)
            y_conf.append(probs[lbl])

    acc = accuracy_score(y_true, y_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(y_true, y_pred, average="macro", zero_division=0)
    
    # Expected Calibration Error (ECE)
    confidences = np.array(y_conf)
    corrects = (np.array(y_true) == np.array(y_pred)).astype(int)
    bins = np.linspace(0, 1, 11)
    ece = 0.0
    for i in range(len(bins) - 1):
        in_bin = (confidences >= bins[i]) & (confidences < bins[i+1])
        if np.sum(in_bin) > 0:
            bin_acc = np.mean(corrects[in_bin])
            bin_conf = np.mean(confidences[in_bin])
            ece += np.abs(bin_acc - bin_conf) * (np.sum(in_bin) / len(confidences))

    return {
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1": f1,
        "ece": ece
    }

def main():
    taxonomy, question_bank, dataset = load_all()
    
    train_data = [d for d in dataset if d["split"] == "train"]
    val_data = [d for d in dataset if d["split"] == "val"]
    
    splits = {
        "test_iid": [d for d in dataset if d["split"] == "test_iid"],
        "test_unseen_question": [d for d in dataset if d["split"] == "test_unseen_question"],
        "test_unseen_style": [d for d in dataset if d["split"] == "test_unseen_style"],
        "test_unseen_misconception": [d for d in dataset if d["split"] == "test_unseen_misconception"],
        "test_human": [d for d in dataset if d["split"] == "test_human"]
    }

    print(f"Training models on {len(train_data)} training samples...")
    X_train = train_data
    y_train = [d["label"] for d in train_data]

    # Instantiate models
    b0 = B0Rules(taxonomy)

    b1 = B1AnswerOnly()
    b1.fit(X_train, y_train)

    b2 = B2TfidfText()
    b2.fit(X_train, y_train)

    b3 = B3CodeAware()
    b3.fit(X_train, y_train)

    b6 = B6Hybrid(taxonomy, question_bank)
    b6.fit(X_train, y_train)

    models = {
        "B0_Rules": b0,
        "B1_AnswerOnly": b1,
        "B2_TfidfText": b2,
        "B3_CodeAware": b3,
        "B6_Hybrid": b6
    }

    results = {}
    print("\n=================================== PER-MODEL EVALUATION TABLE ===================================")
    header = f"{'Model':15s} | {'Split':25s} | {'Accuracy':8s} | {'Macro-F1':8s} | {'ECE':8s}"
    print(header)
    print("-" * len(header))

    for m_name, model in models.items():
        results[m_name] = {}
        for sp_name, sp_data in splits.items():
            if not sp_data:
                continue
            metrics = eval_model_split(model, sp_data)
            results[m_name][sp_name] = metrics
            print(f"{m_name:15s} | {sp_name:25s} | {metrics['accuracy']*100:7.2f}% | {metrics['f1']*100:7.2f}% | {metrics['ece']:7.4f}")

    # Evaluate Novelty / Abstention AUROC on test_unseen_misconception
    print("\n--- NOVELTY ABSTENTION AUROC (test_unseen_misconception) ---")
    unseen_misc_data = splits["test_unseen_misconception"]
    iid_data = splits["test_iid"][:len(unseen_misc_data)]
    eval_novelty_set = unseen_misc_data + iid_data
    
    # Label: 1 if novel/unseen misconception, 0 if known
    y_novel_true = [1 if d["split"] == "test_unseen_misconception" else 0 for d in eval_novelty_set]
    b6_confs = [b6.predict(item)[1] for item in eval_novelty_set]
    # Invert confidence (lower confidence -> higher likelihood of novel)
    auroc = roc_auc_score(y_novel_true, [1.0 - c for c in b6_confs])
    print(f"B6 Hybrid Novel Misconception Detection AUROC: {auroc:.4f}")

    # Save metrics JSON artifact
    with open("evaluation/results/metrics_summary.json", "w") as f:
        json.dump(results, f, indent=2)

    print("\nResults saved to evaluation/results/metrics_summary.json")

if __name__ == "__main__":
    main()
