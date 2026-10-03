# Re:Learn — Adaptive Multimodal Learning Environment for Introductory Python

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

# 4. Run master evaluation pipeline (rebuilds splits, trains B0-B6, runs ablation & simulation)
npm run eval

# 5. Launch full application (FastAPI ML engine + Next.js UI)
npm run dev:all
```

Open [http://localhost:3000](http://localhost:3000) to access the interactive learning environment.

---

## 2. Official Problem Statement & Rubric-to-Code Mapping

| Problem Statement / Rubric Requirement | Implementation File(s) | Description |
|---|---|---|
| **1. Misconception Dataset** | [`ml/data/taxonomy.yaml`](file:///home/prem/Prem%20Projects/Bnb26_Winning-Team_Internal_Round/ml/data/taxonomy.yaml)<br/>[`ml/scripts/build_dataset.py`](file:///home/prem/Prem%20Projects/Bnb26_Winning-Team_Internal_Round/ml/scripts/build_dataset.py) | 12 Python misconceptions, 60 verified questions, 2,710 multi-persona labeled submissions with zero-leakage splits. |
| **2. Misconception Model** | [`ml/relearn_ml/models.py`](file:///home/prem/Prem%20Projects/Bnb26_Winning-Team_Internal_Round/ml/relearn_ml/models.py)<br/>[`ml/relearn_ml/ast_features.py`](file:///home/prem/Prem%20Projects/Bnb26_Winning-Team_Internal_Round/ml/relearn_ml/ast_features.py) | Hybrid AST code features + TF-IDF n-grams + calibrated probabilities ($B_0$ to $B_6$). |
| **3. Misconception Differentiation** | [`ml/relearn_ml/bayes.py`](file:///home/prem/Prem%20Projects/Bnb26_Winning-Team_Internal_Round/ml/relearn_ml/bayes.py)<br/>[`ml/relearn_ml/selector.py`](file:///home/prem/Prem%20Projects/Bnb26_Winning-Team_Internal_Round/ml/relearn_ml/selector.py) | Bayesian belief updates & Expected Information Gain (EIG) active probe selection separating confusable pairs. |
| **4. Adaptive Intervention** | [`ml/serve.py`](file:///home/prem/Prem%20Projects/Bnb26_Winning-Team_Internal_Round/ml/serve.py)<br/>[`src/app/api/response/analyze/route.ts`](file:///home/prem/Prem%20Projects/Bnb26_Winning-Team_Internal_Round/src/app/api/response/analyze/route.ts) | 4 grounded intervention types (micro-explanation, counterexample, worked-example, predict-then-run). |
| **5. Resolution Assessment** | [`ml/relearn_ml/resolution.py`](file:///home/prem/Prem%20Projects/Bnb26_Winning-Team_Internal_Round/ml/relearn_ml/resolution.py)<br/>[`ml/scripts/sim_learners.py`](file:///home/prem/Prem%20Projects/Bnb26_Winning-Team_Internal_Round/ml/scripts/sim_learners.py) | BKT-style state machine requiring $\ge 2$ discriminating transfer probes + explanation check (0.00% false resolutions vs 16.80% naive). |
| **6. Learner Model & Persistence** | [`prisma/schema.prisma`](file:///home/prem/Prem%20Projects/Bnb26_Winning-Team_Internal_Round/prisma/schema.prisma)<br/>[`src/app/dashboard/page.tsx`](file:///home/prem/Prem%20Projects/Bnb26_Winning-Team_Internal_Round/src/app/dashboard/page.tsx) | 13 Prisma tables tracking misconception history, concept mastery, session traces with zero fake numbers. |
| **7. Held-Out Evaluation** | [`ml/scripts/run_full_eval.sh`](file:///home/prem/Prem%20Projects/Bnb26_Winning-Team_Internal_Round/ml/scripts/run_full_eval.sh)<br/>[`docs/EVALUATION.md`](file:///home/prem/Prem%20Projects/Bnb26_Winning-Team_Internal_Round/docs/EVALUATION.md) | Reproducible benchmark script (`npm run eval`), bootstrap 95% CIs [95.56%, 98.33%], ablation, error analysis. |

---

## 3. Architecture & Core Workflow

```
[Student Response] ---> [Python AST & Text Features] ---> [Classifier P(e|M)]
                                                               |
                                                               v
[EIG Active Probe] <--- [Expected Info Gain] <--- [Bayesian Posterior Update P(M|e)]
                                                               |
                                                               v
[Resolution Verdict] <--- [BKT State Machine & Transfer Probes] <--- [Targeted Intervention]
```

Detailed architecture diagrams: [`docs/ARCHITECTURE.md`](file:///home/prem/Prem%20Projects/Bnb26_Winning-Team_Internal_Round/docs/ARCHITECTURE.md).

---

## 4. Key Reproducible Benchmark Results

- **Held-Out Accuracy (`test_unseen_question`):** **97.04%** (Bootstrap 95% CI: [95.56%, 98.33%])
- **False-Resolution Rate:** **0.00%** (vs 16.80% for naive single follow-up policy)
- **Calibration Error (ECE):** **0.0922** (Hybrid $B_6$)
- **Reproducibility:** Run `npm run eval` to regenerate all metrics and figures. View live metrics in-app at [`/lab`](http://localhost:3000/lab).

---

## 5. Limitations & Security

Full details available in [`docs/LIMITATIONS.md`](file:///home/prem/Prem%20Projects/Bnb26_Winning-Team_Internal_Round/docs/LIMITATIONS.md):
- **Domain Scope:** Introductory Python 3 Programming only.
- **Prompt Injection Defense:** Student inputs are strictly quoted as data payload fields within structured JSON schemas.
