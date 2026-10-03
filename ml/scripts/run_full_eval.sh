#!/usr/bin/env bash
set -e

echo "=== RE:LEARN MASTER EVALUATION PIPELINE ==="

echo "1. Rebuilding Dataset & Verifying Split Isolation..."
PYTHONPATH=. ml/venv/bin/python ml/scripts/build_dataset.py
PYTHONPATH=. ml/venv/bin/python ml/scripts/verify_splits.py

echo "2. Training & Evaluating Models (B0 - B6)..."
PYTHONPATH=. ml/venv/bin/python ml/scripts/train_and_evaluate.py

echo "3. Running Real Component Ablation Study..."
PYTHONPATH=. ml/venv/bin/python ml/scripts/ablate.py

echo "4. Running Confusable-Pair Differentiation Benchmark..."
PYTHONPATH=. ml/venv/bin/python ml/scripts/eval_differentiation.py

echo "5. Running BKT Resolution Simulation Study (N=500)..."
PYTHONPATH=. ml/venv/bin/python ml/scripts/sim_learners.py

echo "6. Generating Docs & Statistical Report..."
PYTHONPATH=. ml/venv/bin/python ml/scripts/generate_evaluation_report.py

echo "=== MASTER EVALUATION PIPELINE COMPLETE ==="
