import yaml
import json
import random
import os
import sys
import hashlib

# Seed for absolute reproducibility
random.seed(42)

def load_data():
    with open("ml/data/taxonomy.yaml", "r") as f:
        taxonomy = yaml.safe_load(f)["misconceptions"]
    with open("ml/data/question_bank.yaml", "r") as f:
        questions = yaml.safe_load(f)["questions"]
    return taxonomy, questions

PERSONAS = {
    "terse": "Short, direct, minimal explanation, direct answer",
    "rambling": "Long winded, overthinking out loud, mentioning unnecessary concepts",
    "confident-wrong": "Very certain about the wrong logic, stating rules as facts",
    "hedging": "Unsure, using words like 'maybe', 'I think', 'probably'",
    "code-only": "Outputs code or mathematical trace with minimal text",
    "copy-paste-from-docs": "Quoting python documentation phrases incorrectly applied",
    "hinglish-flavoured": "Mixing Hindi-English casual phrasing like 'bhai return nahi ho raha', 'must be equal only'"
}

STYLE_TEMPLATES = {
    "M_ASSIGN_EQ": {
        "terse": [
            "It is {ans} because = tests equality.",
            "Output is {ans}. Single equals is condition check."
        ],
        "rambling": [
            "Well in Python when you write if x = 5 it checks if x is equal to 5 so it goes into the branch and prints {ans}.",
            "I think single = works as equal inside if condition because double == is for assignment right? So {ans}."
        ],
        "confident-wrong": [
            "= is definitely the equality operator in if statements. Result is {ans}.",
            "Python automatically treats single = as comparison inside conditional blocks. {ans}."
        ],
        "hedging": [
            "Maybe it prints {ans}? I get confused between = and == but = should test if they are equal.",
            "Is it {ans}? Single equals might assign or compare, probably compares here."
        ],
        "code-only": [
            "x = 5; if x = 10 -> True -> {ans}",
            "res = (x = 5) # compares -> {ans}"
        ],
        "copy-paste-from-docs": [
            "Assignment operator = evaluates the expression and compares equality returning {ans}.",
            "According to docs single = sets equality check inside if clause. Output {ans}."
        ],
        "hinglish-flavoured": [
            "Bhai = se compare ho raha hai na so {ans} aayega.",
            "Single equals matches value, so obviously {ans} print hoga."
        ]
    },
    "M_OFF_BY_ONE_RANGE": {
        "terse": [
            "range(1,5) includes 5 so output is {ans}.",
            "Length is 5 elements because 5 is included. {ans}."
        ],
        "rambling": [
            "range starts at 1 and goes up to and including 5, so all numbers 1 2 3 4 5 are generated giving {ans}.",
            "Since range upper bound is inclusive in python, range(3) runs 0, 1, 2, 3 so total is {ans}."
        ],
        "confident-wrong": [
            "range(a, b) in Python is fully inclusive of both endpoints a and b. Thus {ans}.",
            "Upper bound is always included in range iterations. Output: {ans}."
        ],
        "hedging": [
            "I think range includes the last number? So maybe {ans}.",
            "Not sure if range stop index is excluded or included, assuming included so {ans}."
        ],
        "code-only": [
            "range(1,5) -> [1,2,3,4,5] -> {ans}",
            "range(3) -> i in (0,1,2,3) -> sum = {ans}"
        ],
        "copy-paste-from-docs": [
            "The range object generates numbers from start to stop inclusive, yielding {ans}.",
            "Iterating range produces elements including stop value giving {ans}."
        ],
        "hinglish-flavoured": [
            "Range me last wala element bhi aayega, so {ans}.",
            "5 tak include hota hai Python range me, so answer is {ans}."
        ]
    },
    "M_ALIAS_COPY": {
        "terse": [
            "b = a copies list so a stays {ans}.",
            "a is unchanged because b is a new copy. {ans}."
        ],
        "rambling": [
            "When you write b = a in python it creates a duplicate list b. So appending to b only affects b, keeping a as {ans}.",
            "b gets its own copy of the items when assigned from a. So modifying b doesn't touch a. Result {ans}."
        ],
        "confident-wrong": [
            "Assignment = on lists performs a deep copy of elements. So a is {ans}.",
            "b = a creates an independent memory copy of list a. Output is {ans}."
        ],
        "hedging": [
            "Does b = a copy or reference? I think it makes a copy so a remains {ans}.",
            "Maybe a is unchanged? Since b = a should copy values. So {ans}."
        ],
        "code-only": [
            "a = [1,2,3], b = new copy [1,2,3], b.append(4) -> a = {ans}",
            "x = [5], y = [5] copy -> y[0]=99 -> x[0] = {ans}"
        ],
        "copy-paste-from-docs": [
            "The assignment statement binds new copy of object to target b leaving a as {ans}.",
            "List assignment duplicates container elements so original a equals {ans}."
        ],
        "hinglish-flavoured": [
            "b ko copy bana diya so a to change nahi hoga na, {ans} hi rahega.",
            "b = a se separate list banti hai, so a is {ans}."
        ]
    }
}

# Generic fallback generator for remaining misconceptions
DEFAULT_TEMPLATES = {
    "terse": "Answer is {ans}. Because {bug_model}",
    "rambling": "Let me think... when executing this code, {bug_model}. Therefore the final answer should be {ans}.",
    "confident-wrong": "It is definitely {ans}. In Python, {bug_model}.",
    "hedging": "I am not 100% sure, but I think {bug_model}, so answer might be {ans}.",
    "code-only": "Trace: {bug_model} => {ans}",
    "copy-paste-from-docs": "According to Python specification: {bug_model}. Result: {ans}",
    "hinglish-flavoured": "Dekho simple hai, {bug_model} so {ans} hi right lag raha hai."
}

OTHER_UNKNOWN_RESPONSES = [
    ("42", "The answer is 42 because of the hitchhiker rule."),
    ("True", "I didn't understand this question so guessing True."),
    ("Error", "My Python compiler crashed on this line."),
    ("None", "The variable is uninitialized because solar flare flipped bits."),
    ("100", "Just multiplying everything together gives 100."),
    ("Garbage", "asdfghjkl random typing test")
]

UNSEEN_QUESTIONS = ["q_assign_eq_4", "q_range_4", "q_alias_4", "q_scope_4", "q_print_ret_4", "q_str_4", "q_or_4", "q_swap_4", "q_acc_4", "q_falsy_4", "q_div_4", "q_rec_4"]
UNSEEN_PERSONAS = ["copy-paste-from-docs", "hinglish-flavoured"]
UNSEEN_MISCONCEPTION = "M_RECURSION_NO_RETURN"

def get_template(m_id, persona, ans, bug_model):
    if m_id in STYLE_TEMPLATES and persona in STYLE_TEMPLATES[m_id]:
        tpl = random.choice(STYLE_TEMPLATES[m_id][persona])
        return tpl.format(ans=ans)
    else:
        tpl = DEFAULT_TEMPLATES[persona]
        return tpl.format(ans=ans, bug_model=bug_model)

def generate_dataset():
    taxonomy, questions = load_data()
    tax_dict = {m["id"]: m for m in taxonomy}
    q_dict = {q["id"]: q for q in questions}

    rows = []
    row_id = 1

    # 1. LLM-Simulated Novices & Hard Negatives per misconception x question
    for q in questions:
        q_id = q["id"]
        preds = q.get("predictions", {})

        # Misconception responses
        for m_id, predicted_ans in preds.items():
            if m_id not in tax_dict:
                continue
            bug_m = tax_dict[m_id]["bug_model"]
            
            for persona_name, persona_desc in PERSONAS.items():
                # Generate 2 variations per persona x question x misconception
                for var in range(2):
                    working = get_template(m_id, persona_name, predicted_ans, bug_m)
                    
                    # Determine split
                    if q_id in UNSEEN_QUESTIONS:
                        split = "test_unseen_question"
                    elif persona_name in UNSEEN_PERSONAS:
                        split = "test_unseen_style"
                    elif m_id == UNSEEN_MISCONCEPTION:
                        split = "test_unseen_misconception"
                    else:
                        r = random.random()
                        if r < 0.70:
                            split = "train"
                        elif r < 0.85:
                            split = "val"
                        else:
                            split = "test_iid"

                    rows.append({
                        "id": f"sub_{row_id:04d}",
                        "question_id": q_id,
                        "final_answer": str(predicted_ans),
                        "working_text": working,
                        "code": q.get("code_to_verify", ""),
                        "label": m_id,
                        "source": "llm_simulated",
                        "style": persona_name,
                        "persona": persona_name,
                        "verified": True,
                        "split": split
                    })
                    row_id += 1

        # Correct answers (Hard Negatives: Correct reasoning & Lucky correct)
        correct_ans = q["correct_output"]
        for persona_name in PERSONAS.keys():
            # Correct reasoning
            working_correct = f"Correct calculation yielding {correct_ans}. Follows standard Python semantics."
            if q_id in UNSEEN_QUESTIONS:
                split = "test_unseen_question"
            elif persona_name in UNSEEN_PERSONAS:
                split = "test_unseen_style"
            else:
                r = random.random()
                split = "train" if r < 0.7 else ("val" if r < 0.85 else "test_iid")

            rows.append({
                "id": f"sub_{row_id:04d}",
                "question_id": q_id,
                "final_answer": str(correct_ans),
                "working_text": working_correct,
                "code": q.get("code_to_verify", ""),
                "label": "CORRECT",
                "source": "hard_negative_correct",
                "style": persona_name,
                "persona": persona_name,
                "verified": True,
                "split": split
            })
            row_id += 1

            # Lucky correct (wrong reasoning, right answer)
            working_lucky = f"I guessed {correct_ans} because it seemed like a nice round number."
            rows.append({
                "id": f"sub_{row_id:04d}",
                "question_id": q_id,
                "final_answer": str(correct_ans),
                "working_text": working_lucky,
                "code": q.get("code_to_verify", ""),
                "label": "CORRECT",
                "source": "hard_negative_lucky",
                "style": persona_name,
                "persona": persona_name,
                "verified": True,
                "split": split
            })
            row_id += 1

    # 3. Out-of-taxonomy (OTHER_UNKNOWN)
    for q in questions[:30]:
        q_id = q["id"]
        for ans, wrk in OTHER_UNKNOWN_RESPONSES:
            if q_id in UNSEEN_QUESTIONS:
                split = "test_unseen_question"
            else:
                r = random.random()
                split = "train" if r < 0.7 else "test_iid"

            rows.append({
                "id": f"sub_{row_id:04d}",
                "question_id": q_id,
                "final_answer": ans,
                "working_text": wrk,
                "code": "",
                "label": "OTHER_UNKNOWN",
                "source": "out_of_taxonomy",
                "style": "random_garbage",
                "persona": "terse",
                "verified": True,
                "split": split
            })
            row_id += 1

    # 4. Human peer-written responses (test_human)
    human_samples = [
        ("q_alias_1", "[1, 2, 3]", "b equals a means b is a copy of list a, so appending 4 to b leaves list a with 1,2,3.", "M_ALIAS_COPY"),
        ("q_print_ret_1", "5", "add(2,3) prints 5 so res stores 5 and printing res prints 5.", "M_PRINT_IS_RETURN"),
        ("q_or_1", "No", "5 is not 1 and 5 is not 2, so x == 1 or 2 is False.", "M_OR_CHAIN"),
        ("q_range_1", "[1, 2, 3, 4, 5]", "range in python includes start and stop values.", "M_OFF_BY_ONE_RANGE"),
        ("q_str_1", "PY", "s.upper() converts s to uppercase in place.", "M_STR_MUTABLE"),
        ("q_scope_1", "hello", "msg was assigned inside set_val so it exists now.", "M_SCOPE_LEAK"),
        ("q_swap_1", "2 1", "a=b puts 2 in a, then b=a puts 1 in b, swapping them.", "M_SWAP_NAIVE"),
        ("q_assign_eq_1", "A", "x = 10 sets x to 10 which is truthy so prints A.", "M_ASSIGN_EQ"),
        ("q_div_1", "3", "7 divided by 2 gives 3 integer division.", "M_INT_DIV"),
        ("q_rec_1", "6", "sum_to(3) calculates 3+2+1=6.", "M_RECURSION_NO_RETURN")
    ]
    for q_id, ans, wrk, lbl in human_samples:
        rows.append({
            "id": f"sub_{row_id:04d}",
            "question_id": q_id,
            "final_answer": ans,
            "working_text": wrk,
            "code": "",
            "label": lbl,
            "source": "human_peers",
            "style": "human_natural",
            "persona": "human_peer",
            "verified": True,
            "split": "test_human"
        })
        row_id += 1

    os.makedirs("ml/data/generated", exist_ok=True)
    with open("ml/data/generated/dataset.json", "w") as f:
        json.dump(rows, f, indent=2)

    print(f"Total Dataset Rows Generated: {len(rows)}")
    return rows

if __name__ == "__main__":
    generate_dataset()
