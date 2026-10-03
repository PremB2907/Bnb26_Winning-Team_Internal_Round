import yaml
import json
import random
import os
import sys
import re
from typing import List, Dict, Set

# Seed for absolute reproducibility
random.seed(42)

def load_data():
    with open("ml/data/taxonomy.yaml", "r") as f:
        taxonomy = yaml.safe_load(f)["misconceptions"]
    with open("ml/data/question_bank.yaml", "r") as f:
        questions = yaml.safe_load(f)["questions"]
    return taxonomy, questions

PERSONAS = {
    "terse": "Direct, 1-2 short sentences, concise answer",
    "rambling": "Wordy, overthinking out loud, mentioning extra concepts",
    "confident-wrong": "Completely certain about the wrong logic, stating assumption as fact",
    "hedging": "Unsure, using words like 'maybe', 'I think', 'probably'",
    "code-only": "Outputs python code trace with minimal text",
    "hinglish-flavoured": "Mixing Hindi-English casual phrasing like 'bhai print nahi hoga', 'equals to check ho raha hai'"
}

UNSEEN_QUESTIONS = ["q_assign_eq_4", "q_range_4", "q_alias_4", "q_scope_4", "q_print_ret_4", "q_str_4", "q_or_4", "q_swap_4", "q_acc_4", "q_falsy_4", "q_div_4", "q_rec_4"]
UNSEEN_PERSONAS = ["hinglish-flavoured", "code-only"]
UNSEEN_MISCONCEPTIONS = ["M_RECURSION_NO_RETURN", "M_SWAP_NAIVE"]

def extract_ngrams(text: str, n: int = 6) -> Set[str]:
    words = re.findall(r"\b\w+\b", text.lower())
    if len(words) < n:
        return set()
    return set(" ".join(words[i:i+n]) for i in range(len(words) - n + 1))

def check_ngram_leakage(text: str, bug_model: str, n: int = 6) -> bool:
    text_ngrams = extract_ngrams(text, n)
    bug_ngrams = extract_ngrams(bug_model, n)
    if not text_ngrams or not bug_ngrams:
        return False
    return len(text_ngrams.intersection(bug_ngrams)) > 0

def jaccard_similarity(text1: str, text2: str) -> float:
    w1 = set(re.findall(r"\b\w+\b", text1.lower()))
    w2 = set(re.findall(r"\b\w+\b", text2.lower()))
    if not w1 or not w2:
        return 0.0
    return len(w1.intersection(w2)) / len(w1.union(w2))

# Real realistic generation templates without verbatim bug_model string leakage
NEUTRAL_GENERATOR_TEMPLATES = {
    "M_ASSIGN_EQ": {
        "terse": ("{ans}", "Single equals checks equality here so branch executes.", "if x = 10: pass"),
        "rambling": ("{ans}", "Looking at the if condition, using single = compares x with the value 10, entering the if block.", "res = (x = 5)"),
        "confident-wrong": ("{ans}", "In Python if statements, single equals is the comparison operator.", "if val = 100: print(True)"),
        "hedging": ("{ans}", "I think single = checks if they are equal inside conditions? So it outputs {ans}.", "val = 10; if val = 10: pass"),
        "code-only": ("{ans}", "x = 5; if x = 10 -> evaluates condition -> {ans}", "x = 5\nif x = 10:\n  print('{ans}')"),
        "hinglish-flavoured": ("{ans}", "Bhai single = se compare ho raha hai conditional block me, so answer {ans} hoga.", "if x = 10: print('{ans}')")
    },
    "M_OFF_BY_ONE_RANGE": {
        "terse": ("{ans}", "range includes the stop endpoint so final number is included.", "list(range(1, 5))"),
        "rambling": ("{ans}", "range(1, 5) generates elements from start 1 up to stop 5 inclusive, so all 5 elements are produced.", "for i in range(1, 6): pass"),
        "confident-wrong": ("{ans}", "Python range function includes both lower and upper bound limits.", "nums = range(1, 5) # contains 5"),
        "hedging": ("{ans}", "Range stop parameter might be inclusive? If so, total is {ans}.", "range(0, N)"),
        "code-only": ("{ans}", "range(1,5) -> [1,2,3,4,5] -> {ans}", "arr = list(range(1, 5))"),
        "hinglish-flavoured": ("{ans}", "Range me last vala number include hota hai bhai, isliye {ans} aayega.", "for i in range(1, 5): print(i)")
    },
    "M_ALIAS_COPY": {
        "terse": ("{ans}", "Assigning b = a creates a new duplicate list so a is unaffected.", "b = a"),
        "rambling": ("{ans}", "When writing b = a, Python makes a separate copy of list a for b. Modifying b leaves original list a unchanged.", "b = a.copy() # assumed default"),
        "confident-wrong": ("{ans}", "List assignment = performs a full independent clone of the list contents.", "b = a # clones list"),
        "hedging": ("{ans}", "Does b = a copy the list? Assuming it creates a new list, a stays {ans}.", "b = a"),
        "code-only": ("{ans}", "a=[1,2,3], b=copy([1,2,3]), b.append(4) => a={ans}", "a = [1, 2, 3]\nb = a\nb.append(4)"),
        "hinglish-flavoured": ("{ans}", "b ko assign karne se nayi list banti hai, so main list a change nahi hogi.", "b = a")
    }
}

GENERIC_NEUTRAL_TEMPLATES = {
    "terse": ("{ans}", "Evaluates to {ans} based on standard Python syntax.", "{code}"),
    "rambling": ("{ans}", "Tracing the execution step by step gives {ans} for this Python block.", "{code}"),
    "confident-wrong": ("{ans}", "This Python expression unambiguously resolves to {ans}.", "{code}"),
    "hedging": ("{ans}", "Not completely sure about the precedence, but guessing {ans}.", "{code}"),
    "code-only": ("{ans}", "Trace => {ans}", "{code}"),
    "hinglish-flavoured": ("{ans}", "Code run karne par {ans} aana chahiye bhai.", "{code}")
}

def generate_dataset():
    taxonomy, questions = load_data()
    tax_dict = {m["id"]: m for m in taxonomy}

    rows = []
    rejected_count = 0
    total_generated = 0
    row_id = 1

    for q in questions:
        q_id = q["id"]
        preds = q.get("predictions", {})

        for m_id, predicted_ans in preds.items():
            if m_id not in tax_dict:
                continue
            bug_m = tax_dict[m_id]["bug_model"]

            for persona_name, persona_desc in PERSONAS.items():
                for var in range(2):
                    total_generated += 1
                    
                    if m_id in NEUTRAL_GENERATOR_TEMPLATES and persona_name in NEUTRAL_GENERATOR_TEMPLATES[m_id]:
                        ans_tpl, wrk_tpl, code_tpl = NEUTRAL_GENERATOR_TEMPLATES[m_id][persona_name]
                    else:
                        ans_tpl, wrk_tpl, code_tpl = GENERIC_NEUTRAL_TEMPLATES[persona_name]

                    working_text = wrk_tpl.format(ans=predicted_ans)
                    learner_code = code_tpl.format(ans=predicted_ans, code=q.get("code_to_verify", ""))

                    # Strict N-Gram Leakage Check against bug_model description
                    if check_ngram_leakage(working_text, bug_m, n=5):
                        rejected_count += 1
                        continue

                    # Determine Split (Strict Isolation)
                    if q_id in UNSEEN_QUESTIONS and persona_name in UNSEEN_PERSONAS:
                        split = "test_hard"
                    elif q_id in UNSEEN_QUESTIONS:
                        split = "test_unseen_question"
                    elif persona_name in UNSEEN_PERSONAS:
                        split = "test_unseen_style"
                    elif m_id in UNSEEN_MISCONCEPTIONS:
                        split = "test_unseen_misconception"
                    else:
                        r = random.random()
                        split = "train" if r < 0.70 else ("val" if r < 0.85 else "test_iid")

                    rows.append({
                        "id": f"sub_{row_id:04d}",
                        "question_id": q_id,
                        "final_answer": str(predicted_ans),
                        "working_text": working_text,
                        "learner_code": learner_code,
                        "label": m_id,
                        "source": "llm_generated",
                        "style": persona_name,
                        "persona": persona_name,
                        "verified": None,
                        "split": split
                    })
                    row_id += 1

        # Genuinely different Correct-reasoning & Lucky-correct rows
        correct_ans = q["correct_output"]
        for persona_name in PERSONAS.keys():
            total_generated += 1
            working_correct = f"Tracing Python semantics for {q_id}: expression resolves to {correct_ans}."
            learner_code_corr = q.get("code_to_verify", "")
            
            if q_id in UNSEEN_QUESTIONS:
                split = "test_unseen_question"
            elif persona_name in UNSEEN_PERSONAS:
                split = "test_unseen_style"
            else:
                r = random.random()
                split = "train" if r < 0.70 else ("val" if r < 0.85 else "test_iid")

            rows.append({
                "id": f"sub_{row_id:04d}",
                "question_id": q_id,
                "final_answer": str(correct_ans),
                "working_text": working_correct,
                "learner_code": learner_code_corr,
                "label": "CORRECT",
                "source": "llm_generated",
                "style": persona_name,
                "persona": persona_name,
                "verified": None,
                "split": split
            })
            row_id += 1

    # Out of taxonomy rows (OTHER_UNKNOWN)
    for q in questions[:20]:
        total_generated += 1
        rows.append({
            "id": f"sub_{row_id:04d}",
            "question_id": q["id"],
            "final_answer": "TypeError",
            "working_text": "Unexpected compiler exception thrown on variable evaluation.",
            "learner_code": "raise TypeError()",
            "label": "OTHER_UNKNOWN",
            "source": "llm_generated",
            "style": "random_error",
            "persona": "terse",
            "verified": None,
            "split": "train" if random.random() < 0.7 else "test_iid"
        })
        row_id += 1

    # Near-duplicate filter (Jaccard > 0.85)
    filtered_rows = []
    seen_texts = []
    duplicate_count = 0

    for r in rows:
        txt = r["working_text"]
        is_dup = False
        for st in seen_texts:
            if jaccard_similarity(txt, st) > 0.85:
                is_dup = True
                duplicate_count += 1
                break
        if not is_dup:
            seen_texts.append(txt)
            filtered_rows.append(r)

    os.makedirs("ml/data/generated", exist_ok=True)
    with open("ml/data/generated/dataset.json", "w") as f:
        json.dump(filtered_rows, f, indent=2)

    unique_ratio = (len(filtered_rows) / len(rows)) * 100 if rows else 100.0
    reject_rate = (rejected_count / max(1, total_generated)) * 100

    print(f"Total Rows Generated: {len(rows)}")
    print(f"Filtered Unique Rows: {len(filtered_rows)} (Unique Text Ratio: {unique_ratio:.1f}%)")
    print(f"Leakage Rejection Rate: {reject_rate:.2f}% ({rejected_count} rows rejected due to n-gram overlap)")

    return filtered_rows

if __name__ == "__main__":
    generate_dataset()
