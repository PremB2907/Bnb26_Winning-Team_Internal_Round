import json
import random
import sys

def verify():
    with open("ml/data/generated/dataset.json", "r") as f:
        data = json.load(f)

    total = len(data)
    print(f"--- DATASET STATS ({total} total rows) ---")

    splits = {}
    sources = {}
    labels = {}

    for d in data:
        sp = d["split"]
        src = d["source"]
        lbl = d["label"]

        splits[sp] = splits.get(sp, 0) + 1
        sources[src] = sources.get(src, 0) + 1
        labels[lbl] = labels.get(lbl, 0) + 1

    print("\n[Rows per Split]")
    for k, v in sorted(splits.items()):
        print(f"  {k:25s}: {v:4d} ({v/total*100:.1f}%)")

    print("\n[Rows per Source]")
    for k, v in sorted(sources.items()):
        print(f"  {k:25s}: {v:4d} ({v/total*100:.1f}%)")

    print("\n[Class Balance & Trivial Class Breakdown]")
    trivial_count = sum(1 for d in data if d["label"] in ("CORRECT", "OTHER_UNKNOWN"))
    misc_count = total - trivial_count
    print(f"  Misconception Classes: {misc_count} ({misc_count/total*100:.1f}%)")
    print(f"  Trivial Classes (CORRECT/OTHER_UNKNOWN): {trivial_count} ({trivial_count/total*100:.1f}%)")

    # Leakage assertions
    print("\n--- LEAKAGE VERIFICATION ---")
    train_q = set(d["question_id"] for d in data if d["split"] == "train")
    unseen_q = set(d["question_id"] for d in data if d["split"] == "test_unseen_question")
    overlap_q = train_q.intersection(unseen_q)
    print(f"Question overlap between train & test_unseen_question: {len(overlap_q)}")

    train_style = set(d["style"] for d in data if d["split"] == "train")
    unseen_style = set(d["style"] for d in data if d["split"] == "test_unseen_style")
    overlap_style = train_style.intersection(unseen_style)
    print(f"Style overlap between train & test_unseen_style: {len(overlap_style)}")

    train_lbl = set(d["label"] for d in data if d["split"] == "train")
    unseen_lbl = set(d["label"] for d in data if d["split"] == "test_unseen_misconception")
    overlap_lbl = train_lbl.intersection(unseen_lbl)
    print(f"Label overlap between train & test_unseen_misconception: {len(overlap_lbl)}")

    assert len(overlap_q) == 0, f"Leakage! {overlap_q}"
    assert len(overlap_style) == 0, f"Leakage! {overlap_style}"
    assert len(overlap_lbl) == 0, f"Leakage! {overlap_lbl}"
    print("ALL LEAKAGE ASSERTIONS PASSED GREEN! Zero data leakage detected.")

    # 15 Samples per source
    print("\n--- 15 RANDOM DATASET SAMPLES ---")
    samples = random.sample(data, min(15, len(data)))
    for s in samples:
        print(f"ID: {s['id']} | Q: {s['question_id']} | Label: {s['label']} | Source: {s['source']} | Split: {s['split']}")
        print(f"  Working: \"{s['working_text']}\"")
        print(f"  LearnerCode: \"{s.get('learner_code', '')}\"")

if __name__ == "__main__":
    verify()
