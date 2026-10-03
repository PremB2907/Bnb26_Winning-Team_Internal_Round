# Re:Learn Limitations & Failure Cases Analysis

## 1. Scope & Out-of-Scope Limitations
- **Domain Restriction:** Designed specifically for **Introductory Python 3 Programming**. It does not cover advanced object-oriented design, async concurrency, or non-Python languages.
- **Natural Language Noise:** Hinglish or highly informal student phrasing can sometimes confuse text TF-IDF n-grams if the AST features are absent.

## 2. Threat Model & Sandbox Execution Safety
- **Learner Code Execution:** Code execution verification for question bank items occurs in a sandboxed subprocess (`sys.executable -c`) with explicit 3-second timeouts.
- **Prompt Injection Defense:** Student input text is passed to the LLM adjudicator as quoted data fields inside a JSON schema payload, preventing instruction override attacks.

## 3. Real Failure Cases from Evaluation

1. **Hinglish Overlap Misclassification (`q_assign_eq_4`):**
   - *Input:* "Bhai = se compare ho raha hai na so True aayega."
   - *True Label:* `M_ASSIGN_EQ`
   - *Predicted:* `M_ALIAS_COPY`
   - *Root Cause:* The word "bhai" and single "=" overlapped with TF-IDF features trained on list assignment phrasings.

2. **Generic Phrasing Misclassification (`q_rec_4`):**
   - *Input:* "Answer is None. Because Thinks returning a value in base case..."
   - *True Label:* `M_RECURSION_NO_RETURN`
   - *Predicted:* `M_ALIAS_COPY`
   - *Root Cause:* The phrase "Answer is None" occurs in multiple misconception surface forms.
