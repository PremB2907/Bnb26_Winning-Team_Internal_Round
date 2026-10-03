# Re:Learn System Architecture

## Pipeline Overview

```mermaid
sequenceDiagram
    autonumber
    actor Learner
    participant UI as Next.js Web UI
    participant Gateway as Next.js API Gateway
    participant ML as FastAPI ML Engine
    participant DB as Prisma SQLite DB

    Learner->>UI: Submit Code / Answer / Working Text
    UI->>Gateway: POST /api/response/analyze
    Gateway->>DB: Save LearningSession & Response
    Gateway->>ML: POST /diagnose (Text + AST + Outcome Map)
    ML-->>Gateway: Return P(M | evidence) & Diagnosis
    Gateway->>DB: Save Diagnosis & MisconceptionHistory
    Gateway->>ML: POST /select-probe (EIG Selection)
    ML-->>Gateway: Return Best Probe Question & EIG score
    Gateway->>DB: Save VerificationAttempt & MasteryRecord
    Gateway-->>UI: Render Bayesian Posterior, Probe & Intervention Card
```

## Core Algorithms
1. **Outcome Mapping:** Executes learner code vs candidate misconception predictions.
2. **Bayesian Belief Update:** $P(M \mid e) \propto P(e_{\text{text}} \mid M) \cdot P(e_{\text{outcome}} \mid M) \cdot P(M)$.
3. **Active Probe Selection (EIG):** Selects probes maximizing $\text{EIG}(Q) = H(P(M)) - \sum_{y} P(y \mid Q) H(P(M \mid Q, y))$.
4. **BKT Resolution State Machine:** Requires $\ge 2$ discriminating transfer probes + clean explanation check + delayed re-probe.
