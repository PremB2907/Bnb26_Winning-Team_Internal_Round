'use client';

import { useState } from 'react';
import './demo.css';

const DEMO_SCENARIOS = {
  programming: {
    title: 'Programming Diagnosis',
    question: 'x = 10\\nif x > 5: print("A")\\nelse: print("B")',
    learnerResponse: 'I selected B because x is greater than 5 so the condition is true.',
    misconception: 'Condition Inversion',
    confidence: '94%',
    evidence: 'Learner evaluated `x > 5` as false when `x = 10`. Interpreted boolean logic in reverse.',
    intervention: 'Read the condition out loud. "Is x greater than 5?" Since x=10, the answer is Yes (True). The first block executes.',
    verifyQuestion: 'age = 18\\nif age < 21: print("Minor")\\nelse: print("Adult")',
    verifyResponse: 'Minor, because 18 is less than 21 which is True.',
    oldScore: '62%',
    newScore: '78%'
  },
  algebra: {
    title: 'Algebra Diagnosis',
    question: 'Simplify: 5 - (2x + 3)',
    learnerResponse: '-2x + 8. I brought the negative in.',
    misconception: 'Sign Distribution Error',
    confidence: '98%',
    evidence: 'Failed to distribute the negative sign to the +3 term.',
    intervention: 'Think of -(2x + 3) as -1 * (2x + 3). Distribute the -1 to BOTH the 2x and the 3.',
    verifyQuestion: 'Simplify: 10 - (x - 4)',
    verifyResponse: '-x + 14',
    oldScore: '45%',
    newScore: '55%'
  },
  physics: {
    title: 'Physics Diagnosis',
    question: 'A car travels on a straight highway at a constant 60 mph. What is its acceleration?',
    learnerResponse: '60, because that is how fast it is going.',
    misconception: 'Acceleration interpreted as Speed',
    confidence: '91%',
    evidence: 'Learner equated constant velocity directly with acceleration.',
    intervention: 'Acceleration is the feeling of being pushed back in your seat. If you are cruising at a steady speed, acceleration is zero.',
    verifyQuestion: 'A spaceship glides through deep space at a constant 1000 m/s. What is its acceleration?',
    verifyResponse: '0',
    oldScore: '80%',
    newScore: '88%'
  }
};

export default function DemoInteractive() {
  const [scenario, setScenario] = useState<keyof typeof DEMO_SCENARIOS | null>(null);
  const [step, setStep] = useState(0);

  if (!scenario) {
    return (
      <div className="demo-container">
        <div className="demo-header text-center">
          <h1>Re:<span>Learn</span></h1>
          <p className="subtitle">Don't just detect wrong answers. Understand why.</p>
        </div>
        
        <div className="scenario-selector">
          <button className="btn-prog" onClick={() => { setScenario('programming'); setStep(0); }}>PROGRAMMING DIAGNOSIS</button>
          <button className="btn-alg" onClick={() => { setScenario('algebra'); setStep(0); }}>ALGEBRA DIAGNOSIS</button>
          <button className="btn-phy" onClick={() => { setScenario('physics'); setStep(0); }}>PHYSICS DIAGNOSIS</button>
        </div>
      </div>
    );
  }

  const s = DEMO_SCENARIOS[scenario];

  return (
    <div className="demo-container">
      <header className="demo-nav">
        <button className="btn-back" onClick={() => setScenario(null)}>← Back to Scenarios</button>
        <h2 className="domain-title">{s.title}</h2>
      </header>

      <div className="flow-container">
        {/* Step 1: Question and Wrong Answer */}
        <div className={`flow-step ${step >= 0 ? 'visible' : ''}`}>
          <div className="card q-card">
            <div className="badge">QUESTION</div>
            <pre className="code-block">{s.question}</pre>
          </div>
          
          <div className="card a-card wrong">
            <div className="badge">LEARNER RESPONSE</div>
            <p>{s.learnerResponse}</p>
          </div>
          
          {step === 0 && <button className="btn-next" onClick={() => setStep(1)}>Run Diagnosis →</button>}
        </div>

        {/* Step 2: Diagnosis */}
        {step >= 1 && (
          <div className="flow-step visible">
            <div className="arrow-down">↓</div>
            <div className="card diag-card">
              <h3>🔍 MISCONCEPTION DETECTED</h3>
              <div className="m-title">{s.misconception}</div>
              <div className="confidence">{s.confidence} confidence</div>
              
              <div className="evidence-box">
                <h4>Evidence</h4>
                <p>{s.evidence}</p>
              </div>
            </div>

            {step === 1 && <button className="btn-next" onClick={() => setStep(2)}>Generate Intervention →</button>}
          </div>
        )}

        {/* Step 3: Intervention */}
        {step >= 2 && (
          <div className="flow-step visible">
            <div className="arrow-down">↓</div>
            <div className="card int-card">
              <h3>🧠 TARGETED INTERVENTION</h3>
              <p>{s.intervention}</p>
            </div>

            {step === 2 && <button className="btn-next" onClick={() => setStep(3)}>Verify Resolution →</button>}
          </div>
        )}

        {/* Step 4: Verification */}
        {step >= 3 && (
          <div className="flow-step visible">
            <div className="arrow-down">↓</div>
            <div className="card q-card">
              <div className="badge badge-verify">🧪 VERIFY</div>
              <pre className="code-block">{s.verifyQuestion}</pre>
            </div>

            <div className="card a-card correct">
              <div className="badge">LEARNER RESPONSE</div>
              <p>{s.verifyResponse}</p>
            </div>

            {step === 3 && <button className="btn-next" onClick={() => setStep(4)}>Evaluate →</button>}
          </div>
        )}

        {/* Step 5: Resolution & Update */}
        {step >= 4 && (
          <div className="flow-step visible">
            <div className="arrow-down">↓</div>
            <div className="card res-card">
              <h3>✅ CONCEPTUAL GAP RESOLVED</h3>
              <div className="confidence">Confidence: 91%</div>
              
              <div className="model-update">
                <h3>📈 LEARNER MODEL UPDATED</h3>
                <div className="score-transition">
                  <span className="concept-name">{s.misconception.split(' ')[0]} Concept</span>
                  <span className="scores">{s.oldScore} → <span className="highlight">{s.newScore}</span></span>
                </div>
              </div>
            </div>

            <div className="arrow-down">↓</div>
            <div className="adaptation-notice">
              Next question automatically adapted.
            </div>
            
            <button className="btn-reset" onClick={() => setScenario(null)}>End Demo</button>
          </div>
        )}
      </div>
    </div>
  );
}
