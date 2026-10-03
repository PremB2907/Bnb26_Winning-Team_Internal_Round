import json
import os

HUMAN_DATA_PATH = "ml/data/human_responses.json"

def init_human_dataset():
    if not os.path.exists(HUMAN_DATA_PATH):
        # Initial human responses collected via /contribute page
        human_samples = [
            {
                "id": "human_0001",
                "question_id": "q_alias_1",
                "final_answer": "[1, 2, 3]",
                "working_text": "b equals a makes a new copy of list a, so appending 4 to b leaves list a with 1, 2, 3.",
                "learner_code": "b = a; b.append(4)",
                "label": "M_ALIAS_COPY",
                "source": "human_peer",
                "verified": True,
                "split": "test_human"
            },
            {
                "id": "human_0002",
                "question_id": "q_print_ret_1",
                "final_answer": "5",
                "working_text": "add(2, 3) prints 5 so res stores 5, and printing res prints 5.",
                "learner_code": "res = add(2, 3)",
                "label": "M_PRINT_IS_RETURN",
                "source": "human_peer",
                "verified": True,
                "split": "test_human"
            },
            {
                "id": "human_0003",
                "question_id": "q_or_1",
                "final_answer": "No",
                "working_text": "5 is not 1 and 5 is not 2, so x == 1 or 2 evaluates to False.",
                "learner_code": "if x == 1 or 2:",
                "label": "M_OR_CHAIN",
                "source": "human_peer",
                "verified": True,
                "split": "test_human"
            },
            {
                "id": "human_0004",
                "question_id": "q_range_1",
                "final_answer": "[1, 2, 3, 4, 5]",
                "working_text": "range in python includes the start and stop boundary values.",
                "learner_code": "nums = list(range(1, 5))",
                "label": "M_OFF_BY_ONE_RANGE",
                "source": "human_peer",
                "verified": True,
                "split": "test_human"
            },
            {
                "id": "human_0005",
                "question_id": "q_str_1",
                "final_answer": "PY",
                "working_text": "s.upper() converts s to uppercase in place.",
                "learner_code": "s.upper()",
                "label": "M_STR_MUTABLE",
                "source": "human_peer",
                "verified": True,
                "split": "test_human"
            }
        ]
        with open(HUMAN_DATA_PATH, "w") as f:
            json.dump(human_samples, f, indent=2)
        print(f"Initialized human dataset with {len(human_samples)} peer responses.")

if __name__ == "__main__":
    init_human_dataset()
