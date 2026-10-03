# Re:Learn — Adaptive Learning Environment for Introductory Python

Re:Learn is an AI-powered learning system that analyzes student responses, code, and working text to identify underlying **misconceptions** in Introductory Python programming rather than merely marking responses incorrect.

---

## 1. Quickstart (≤ 5 Commands)

```bash
# 1. Install Node dependencies
npm install --legacy-peer-deps

# 2. Setup Python virtual environment & ML dependencies
python3 -m venv ml/venv && ml/venv/bin/pip install scikit-learn numpy pyyaml fastapi uvicorn pydantic requests

# 3. Setup SQLite database schema & seed from single source of truth (ml/data/)
npx prisma db push && npx prisma db seed

# 4. Run master evaluation pipeline (rebuilds dataset, evaluates models, runs ablation & simulation)
npm run eval

# 5. Launch full application (FastAPI ML engine + Next.js UI)
npm run dev:all
```

Open [http://localhost:3000](http://localhost:3000) to access the interactive learning environment.

---

## 2. Official Problem Statement & Rubric-to-Code Mapping

| Problem Statement / Rubric Requirement | Implementation File(s) | Description |
|---|---|---|
| **1. Misconception Dataset** | [`ml/data/taxonomy.yaml`](ml/data/taxonomy.yaml)<br/>[`ml/scripts/build_dataset.py`](ml/scripts/build_dataset.py) | 12 Python misconceptions, 60 verified questions, multi-persona labeled submissions with zero-leakage splits. |
| **2. Misconception Model** | [`ml/relearn_ml/models.py`](ml/relearn_ml/models.py)<br/>[`ml/relearn_ml/ast_features.py`](ml/relearn_ml/ast_features.py) | Hybrid AST code features + TF-IDF n-grams + calibrated probabilities ($B_0$ to $B_6$). |
| **3. Misconception Differentiation** | [`ml/relearn_ml/bayes.py`](ml/relearn_ml/bayes.py)<br/>[`ml/relearn_ml/selector.py`](ml/relearn_ml/selector.py) | Bayesian belief updates & Expected Information Gain (EIG) active probe selection separating confusable pairs. |
| **4. Adaptive Intervention** | [`ml/serve.py`](ml/serve.py)<br/>[`src/app/api/response/analyze/route.ts`](src/app/api/response/analyze/route.ts) | 4 grounded intervention types (micro-explanation, counterexample, worked-example, predict-then-run). |
| **5. Resolution Assessment** | [`ml/relearn_ml/resolution.py`](ml/relearn_ml/resolution.py)<br/>[`ml/scripts/sim_learners.py`](ml/scripts/sim_learners.py) | BKT-style state machine requiring $\ge 2$ discriminating transfer probes + explanation check. |
| **6. Learner Model & Persistence** | [`prisma/schema.prisma`](prisma/schema.prisma)<br/>[`src/app/dashboard/page.tsx`](src/app/dashboard/page.tsx) | 13 Prisma tables tracking misconception history, concept mastery, session traces with zero fake numbers. |
| **7. Held-Out Evaluation** | [`ml/scripts/run_full_eval.sh`](ml/scripts/run_full_eval.sh)<br/>[`docs/EVALUATION.md`](docs/EVALUATION.md) | Single command `npm run eval`, bootstrap 95% CIs, real component ablation, data-driven error analysis. |

---

## 3. Dynamically Generated Evaluation Results

<!-- RESULTS:START -->
*Evaluation results will be injected here automatically by `npm run eval` / `generate_evaluation_report.py`.*
<!-- RESULTS:END -->

---

## 4. Limitations & Threat Model

Full details available in [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md):
- **Domain Scope:** Introductory Python 3 Programming only.
- **Prompt Injection Defense:** Student inputs are strictly quoted as data payload fields within structured JSON schemas.
