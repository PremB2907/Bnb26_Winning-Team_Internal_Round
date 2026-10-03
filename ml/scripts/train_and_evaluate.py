import json
import yaml
import numpy as np
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, roc_auc_score
from ml.relearn_ml.models import B0Rules, B1AnswerOnly, B2TfidfText, B3CodeAware, B4DenseEmbedder, B6Hybrid
from ml.relearn_ml.calibration import compute_ece

def load_all():
    with open("ml/data/taxonomy.yaml", "r") as f:
        taxonomy = yaml.safe_load(f)["misconceptions"]
    with open("ml/data/question_bank.yaml", "r") as f:
        question_bank = yaml.safe_load(f)["questions"]
    with open("ml/data/generated/dataset.json", "r") as f:
        dataset = json.load(f)
    return taxonomy, question_bank, dataset

def bootstrap_ci(y_true, y_pred, n_bootstraps=1000, alpha=0.05):
    if not y_true or len(y_true) < 2:
        return 0.0, 0.0
    np.random.seed(42)
    boot_accs = []
    n = len(y_true)
    for _ in range(n_bootstraps):
        idxs = np.random.choice(n, size=n, replace=True)
        s_true = [y_true[i] for i in idxs]
        s_pred = [y_pred[i] for i in idxs]
        boot_accs.append(accuracy_score(s_true, s_pred))
    return float(np.percentile(boot_accs, (alpha / 2.0) * 100)), float(np.percentile(boot_accs, (1.0 - alpha / 2.0) * 100))

def eval_model_split(model, test_data, filter_trivial=False):
    if filter_trivial:
        test_data = [d for d in test_data if d["label"] not in ("CORRECT", "OTHER_UNKNOWN")]

    if not test_data:
        return {"accuracy": 0.0, "f1": 0.0, "ece": 0.0, "ci_lower": 0.0, "ci_upper": 0.0, "n_samples": 0}

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

    acc = float(accuracy_score(y_true, y_pred))
    prec, rec, f1, _ = precision_recall_fscore_support(y_true, y_pred, average="macro", zero_division=0)
    ece = compute_ece(y_true, y_pred, y_conf)
    ci_lower, ci_upper = bootstrap_ci(y_true, y_pred)

    return {
        "accuracy": acc,
        "precision": float(prec),
        "recall": float(rec),
        "f1": float(f1),
        "ece": float(ece),
        "ci_lower": ci_lower,
        "ci_upper": ci_upper,
        "n_samples": len(y_true)
    }

def main():
    taxonomy, question_bank, dataset = load_all()
    
    train_data = [d for d in dataset if d["split"] == "train"]
    val_data = [d for d in dataset if d["split"] == "val"]
    
    splits = {
        "test_human": [d for d in dataset if d["split"] == "test_human"],
        "test_unseen_misconception": [d for d in dataset if d["split"] == "test_unseen_misconception"],
        "test_hard": [d for d in dataset if d["split"] == "test_hard"],
        "test_unseen_question": [d for d in dataset if d["split"] == "test_unseen_question"],
        "test_unseen_style": [d for d in dataset if d["split"] == "test_unseen_style"],
        "test_iid": [d for d in dataset if d["split"] == "test_iid"]
    }

    X_train = train_data
    y_train = [d["label"] for d in train_data]

    b0 = B0Rules(taxonomy)

    b1 = B1AnswerOnly()
    b1.fit(X_train, y_train)

    b2 = B2TfidfText()
    b2.fit(X_train, y_train)

    b3 = B3CodeAware()
    b3.fit(X_train, y_train)

    b4 = B4DenseEmbedder()
    b4.fit(X_train, y_train)

    b6 = B6Hybrid(taxonomy, question_bank)
    b6.fit(X_train, y_train, val_data, [d["label"] for d in val_data])

    models = {
        "B0_Rules": b0,
        "B1_AnswerOnly": b1,
        "B2_TfidfText": b2,
        "B3_CodeAware": b3,
        "B4_DenseEmbedder": b4,
        "B6_Hybrid": b6
    }

    results = {}
    print("\n=================================== PER-MODEL EVALUATION TABLE ===================================")
    header = f"{'Model':17s} | {'Split':25s} | {'Acc (All)':9s} | {'Acc (No Triv)':12s} | {'Macro-F1':8s} | {'ECE':7s} | {'95% CI':15s}"
    print(header)
    print("-" * len(header))

    for m_name, model in models.items():
        results[m_name] = {}
        for sp_name, sp_data in splits.items():
            if not sp_data:
                continue
            m_all = eval_model_split(model, sp_data, filter_trivial=False)
            m_notriv = eval_model_split(model, sp_data, filter_trivial=True)
            results[m_name][sp_name] = {
                "all": m_all,
                "no_trivial": m_notriv
            }
            ci_str = f"[{m_all['ci_lower']*100:.1f}%, {m_all['ci_upper']*100:.1f}%]"
            print(f"{m_name:17s} | {sp_name:25s} | {m_all['accuracy']*100:8.2f}% | {m_notriv['accuracy']*100:11.2f}% | {m_all['f1']*100:7.2f}% | {m_all['ece']:6.4f} | {ci_str:15s}")

    # Evaluate Novelty / Abstention AUROC on test_unseen_misconception
    print("\n--- NOVELTY ABSTENTION AUROC ---")
    unseen_misc_data = splits["test_unseen_misconception"]
    iid_data = splits["test_iid"][:len(unseen_misc_data)]
    eval_novelty_set = unseen_misc_data + iid_data
    
    if eval_novelty_set:
        y_novel_true = [1 if d["split"] == "test_unseen_misconception" else 0 for d in eval_novelty_set]
        b6_confs = [b6.predict(item)[1] for item in eval_novelty_set]
        auroc = float(roc_auc_score(y_novel_true, [1.0 - c for c in b6_confs])) if len(set(y_novel_true)) > 1 else 0.5
        print(f"B6 Hybrid Novel Misconception Detection AUROC: {auroc:.4f}")
        results["novelty_auroc"] = auroc

    with open("evaluation/results/metrics_summary.json", "w") as f:
        json.dump(results, f, indent=2)

    print("\nResults saved to evaluation/results/metrics_summary.json")

if __name__ == "__main__":
    main()
