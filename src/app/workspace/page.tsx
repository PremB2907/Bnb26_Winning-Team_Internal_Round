'use client';

import { useState } from 'react';
import Link from 'next/link';
import './workspace.css';

type Phase = 'question' | 'analyzing' | 'diagnosis' | 'verification' | 'resolved';

export default function Workspace() {
  const [phase, setPhase] = useState<Phase>('question');
  const [response, setResponse] = useState('');
  const [diagnosisData, setDiagnosisData] = useState<any>(null);

  // Demo Question
  const question = {
    id: 'Q_PROG_M01_01',
    content: `What is the output?

x = 10
if x > 5:
    print("A")
else:
    print("B")`
  };

  const handleAnalyze = async () => {
    if (!response.trim()) return;
    setPhase('analyzing');
    
    try {
      const res = await fetch('/api/response/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question.id,
          response: response,
          learnerId: 'demo-user'
        })
      });
      const data = await res.json();
      setDiagnosisData(data);
      setPhase('diagnosis');
    } catch (error) {
      console.error(error);
      setPhase('question');
    }
  };

  const handleVerifySubmit = () => {
    // Simply mark as resolved for the demo
    setPhase('resolved');
  };

  return (
    <div className="workspace-container">
      <header className="workspace-header">
        <Link href="/" className="logo">Re:<span>Learn</span></Link>
        <div className="domain-badge">Programming • Boolean Logic</div>
      </header>

      <div className="main-card glass">
        {phase === 'question' && (
          <div className="animate-fade-in">
            <div className="question-area">
              <div className="question-label">Diagnostic Question</div>
              <div className="question-text">{question.content}</div>
            </div>
            <div className="response-area">
              <div className="question-label">Your Response</div>
              <textarea 
                className="response-input" 
                placeholder="Type your answer and explain your reasoning..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              />
              <div className="submit-row">
                <button 
                  className="btn-primary" 
                  onClick={handleAnalyze}
                  disabled={!response.trim()}
                >
                  Submit & Analyze
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === 'analyzing' && (
          <div className="analyzing">
            Analyzing your reasoning...
          </div>
        )}

        {phase === 'diagnosis' && diagnosisData && (
          <div className="animate-fade-in">
            {diagnosisData.diagnosis.misconception_id ? (
              <>
                <div className="diagnosis-header">
                  <h2 className="diagnosis-title">MISCONCEPTION DETECTED</h2>
                  <span className="confidence-badge">
                    {Math.round(diagnosisData.diagnosis.confidence * 100)}% Confidence
                  </span>
                </div>
                
                <div className="evidence-box">
                  <h4>Diagnosis</h4>
                  <p>{diagnosisData.diagnosis.diagnosis}</p>
                </div>
                
                <div className="evidence-box">
                  <h4>Evidence</h4>
                  <ul>
                    {diagnosisData.diagnosis.evidence.map((ev: string, i: number) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>

                {diagnosisData.intervention && (
                  <div className="intervention-box">
                    <h4>Targeted Intervention</h4>
                    <p>{diagnosisData.intervention.content}</p>
                  </div>
                )}

                {diagnosisData.verificationQuestion && (
                  <div className="submit-row" style={{ marginTop: '2rem' }}>
                    <button className="btn-primary" onClick={() => setPhase('verification')}>
                      Verify Understanding →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="correct-state">
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Correct!</h2>
                <p>{diagnosisData.diagnosis.diagnosis}</p>
                <div className="submit-row" style={{ justifyContent: 'center', marginTop: '2rem' }}>
                  <button className="btn-primary" onClick={() => {
                    setResponse('');
                    setPhase('question');
                  }}>
                    Next Question
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {phase === 'verification' && diagnosisData?.verificationQuestion && (
          <div className="animate-fade-in">
             <div className="diagnosis-header">
                <h2 className="diagnosis-title" style={{ color: 'var(--accent-cyan)' }}>VERIFICATION</h2>
             </div>
             <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
               Let's check whether this concept is now clear.
             </p>
            <div className="question-area">
              <div className="question-label">Verification Question</div>
              <div className="question-text">{diagnosisData.verificationQuestion.content}</div>
            </div>
            <div className="response-area">
              <div className="question-label">Your Response</div>
              <textarea 
                className="response-input" 
                placeholder="Type your answer..."
              />
              <div className="submit-row">
                <button className="btn-primary" onClick={handleVerifySubmit}>
                  Submit Answer
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === 'resolved' && (
          <div className="correct-state animate-fade-in">
             <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Misconception Resolved!</h2>
             <p>Your learner model has been updated.</p>
             <div className="submit-row" style={{ justifyContent: 'center', marginTop: '2rem' }}>
                <Link href="/dashboard" className="btn-secondary" style={{ marginRight: '1rem' }}>View Dashboard</Link>
                <button className="btn-primary" onClick={() => {
                  setResponse('');
                  setPhase('question');
                }}>
                  Continue Learning
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
