import yaml
import subprocess
import sys
import os
import json
import json

def run_code_snippet(code):
    try:
        proc = subprocess.run(
            [sys.executable, "-c", code],
            capture_output=True,
            text=True,
            timeout=3
        )
        if proc.returncode != 0 and "SyntaxError" in proc.stderr:
            return "SyntaxError"
        return proc.stdout.strip()
    except subprocess.TimeoutExpired:
        return "Timeout"
    except Exception as e:
        return f"Error: {e}"

def main():
    print("Verifying Question Bank execution outputs...")
    with open("ml/data/taxonomy.yaml", "r") as f:
        taxonomy = yaml.safe_load(f)["misconceptions"]
    
    with open("ml/data/question_bank.yaml", "r") as f:
        questions = yaml.safe_load(f)["questions"]

    m_ids = [m["id"] for m in taxonomy]
    m_count = len(m_ids)
    
    passed = 0
    failed = 0
    
    for q in questions:
        expected = q["correct_output"].strip()
        actual = run_code_snippet(q["code_to_verify"])
        if actual == expected:
            passed += 1
        else:
            failed += 1
            print(f"FAILED item {q['id']}: expected '{expected}', got '{actual}'")

    print(f"Verification complete: {passed}/{len(questions)} items passed.")
    if failed > 0:
        print(f"Error: {failed} items failed output verification!")
        sys.exit(1)

    # Build Confusability Matrix (misconception x misconception: predictions overlap count)
    print("\nBuilding Confusability Matrix...")
    confusability = {m1: {m2: 0 for m2 in m_ids} for m1 in m_ids}
    
    for q in questions:
        preds = q.get("predictions", {})
        for m1 in m_ids:
            for m2 in m_ids:
                if m1 in preds and m2 in preds:
                    if preds[m1] == preds[m2]:
                        confusability[m1][m2] += 1

    # Write confusability matrix & dataset docs to docs/DATASET.md
    with open("docs/DATASET.md", "w") as f:
        f.write("# Misconception Dataset & Taxonomy Specification\n\n")
        f.write(f"## Taxonomy Overview ({len(m_ids)} Misconceptions)\n\n")
        f.write("| ID | Name | Severity | Prerequisites | Confusable With |\n")
        f.write("|---|---|---|---|---|\n")
        for m in taxonomy:
            f.write(f"| `{m['id']}` | {m['name']} | {m['severity']} | {', '.join(m['prerequisites'])} | {', '.join(m['confusable_with'])} |\n")
        
        f.write("\n## Confusability Matrix\n")
        f.write("Number of question items where pairs of misconceptions produce the **identical wrong prediction**:\n\n")
        
        f.write("| Misconception | " + " | ".join(f"`{m}`" for m in m_ids) + " |\n")
        f.write("|---" * (len(m_ids) + 1) + "|\n")
        for m1 in m_ids:
            row_vals = [str(confusability[m1][m2]) for m2 in m_ids]
            f.write(f"| `{m1}` | " + " | ".join(row_vals) + " |\n")

        f.write("\n## Top Confusable Pairs\n")
        pairs = []
        for i in range(m_count):
            for j in range(i + 1, m_count):
                m1, m2 = m_ids[i], m_ids[j]
                overlap = confusability[m1][m2]
                if overlap > 0:
                    pairs.append((overlap, m1, m2))
        pairs.sort(reverse=True)
        for overlap, m1, m2 in pairs[:5]:
            f.write(f"- `{m1}` & `{m2}`: **{overlap} overlapping predictions**\n")

    print("Confusability matrix & documentation saved to docs/DATASET.md")

if __name__ == "__main__":
    main()
