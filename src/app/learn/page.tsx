'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LearnPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQIndex, setSelectedQIndex] = useState<number>(0);
  const [learnerResponse, setLearnerResponse] = useState<string>('');
  const [workingText, setWorkingText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    // Start session and fetch questions
    fetch('/api/session/start', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (data.sessionId) setSessionId(data.sessionId);
      })
      .catch((err) => console.error(err));

    fetch('/api/questions')
      .then((res) => res.json())
      .then((data) => {
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const currentQ = questions[selectedQIndex] || {
    id: 'q_alias_1',
    content: 'a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)',
    expectedAnswer: '[1, 2, 3, 4]'
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysisResult(null);

    let activeSessionId = sessionId;
    if (!activeSessionId) {
      try {
        const startRes = await fetch('/api/session/start', { method: 'POST' });
        const startData = await startRes.json();
        if (startData.sessionId) {
          activeSessionId = startData.sessionId;
          setSessionId(activeSessionId);
        }
      } catch (e) {
        console.error("Failed to start session:", e);
      }
    }

    try {
      const res = await fetch('/api/response/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSessionId,
          questionId: currentQ.id,
          learnerResponse,
          workingText: workingText || learnerResponse,
          learnerCode: currentQ.content,
          modality: 'TEXT'
        })
      });
      const data = await res.json();
      setAnalysisResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto', color: '#f8fafc', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
        <h2>Re:Learn <span style={{ color: '#38bdf8' }}>Interactive Python Learning</span></h2>
        <div>
          <Link href="/dashboard" style={{ marginRight: '1rem', color: '#94a3b8' }}>Dashboard</Link>
          <Link href="/lab" style={{ color: '#94a3b8' }}>Eval Lab</Link>
        </div>
      </header>

      <div style={{ background: '#1e293b', border: '1px solid #3b82f6', borderRadius: '6px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#93c5fd' }}>
        <strong>Data Source Banner:</strong> Real-Time Active Learning Loop | Evaluated on <code>test_unseen_question</code> held-out partition & human-validated <code>test_human</code> set.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Left Column: Problem & Inputs */}
        <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '8px', border: '1px solid #1e293b' }}>
          <h3>Question ({selectedQIndex + 1}/{questions.length || 1})</h3>
          <p style={{ color: '#cbd5e1', whiteSpace: 'pre-wrap', fontFamily: 'monospace', background: '#1e293b', padding: '1rem', borderRadius: '4px' }}>
            {currentQ.content}
          </p>

          <label style={{ display: 'block', marginTop: '1rem', fontWeight: 'bold' }}>Final Output Answer:</label>
          <input
            type="text"
            value={learnerResponse}
            onChange={(e) => setLearnerResponse(e.target.value)}
            placeholder="e.g. [1, 2, 3]"
            style={{ width: '100%', padding: '0.6rem', marginTop: '0.5rem', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
          />

          <label style={{ display: 'block', marginTop: '1rem', fontWeight: 'bold' }}>Working / Explanation Text:</label>
          <textarea
            value={workingText}
            onChange={(e) => setWorkingText(e.target.value)}
            placeholder="Explain your reasoning here..."
            rows={4}
            style={{ width: '100%', padding: '0.6rem', marginTop: '0.5rem', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
          />

          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{ marginTop: '1rem', padding: '0.8rem 1.5rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {loading ? 'Analyzing with ML Engine...' : 'Submit & Analyze Misconception'}
          </button>
        </div>

        {/* Right Column: Diagnosis & Trace Card */}
        <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '8px', border: '1px solid #1e293b' }}>
          <h3>Diagnosis & Bayesian Belief</h3>
          {!analysisResult && !loading && (
            <p style={{ color: '#64748b' }}>Submit an answer to view real-time Bayesian posterior updates, EIG probe recommendations, and BKT resolution state.</p>
          )}
          {loading && <p style={{ color: '#38bdf8' }}>Connecting to FastAPI ML Engine...</p>}

          {analysisResult && analysisResult.error && (
            <div style={{ background: '#451a03', padding: '1rem', borderRadius: '6px', border: '1px solid #78350f', color: '#f97316' }}>
              <strong>Error:</strong> {analysisResult.error || analysisResult.reason}
            </div>
          )}

          {analysisResult && analysisResult.diagnosis && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ background: analysisResult.diagnosis?.misconceptionId ? '#451a03' : '#064e3b', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #78350f' }}>
                <h4 style={{ margin: 0 }}>
                  Verdict: {analysisResult.diagnosis?.misconceptionId ? `Misconception Diagnosed (${analysisResult.diagnosis.misconceptionId})` : 'Correct / No Misconception'}
                </h4>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '14px' }}>
                  Confidence: {((analysisResult.diagnosis?.confidence || 0) * 100).toFixed(1)}% | Status: {analysisResult.diagnosis?.status || 'N/A'}
                </p>
              </div>

              {analysisResult.verification && (
                <div style={{ background: '#1e1b4b', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, color: '#a78bfa' }}>BKT Resolution State</h4>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '14px' }}>
                    State: <strong>{analysisResult.verification.resolutionStatus}</strong>
                  </p>
                </div>
              )}

              {analysisResult.sessionId && (
                <Link href={`/trace/${analysisResult.sessionId}`} style={{ display: 'inline-block', marginTop: '0.5rem', color: '#38bdf8', textDecoration: 'underline' }}>
                  View Full Explainability Timeline for Session {analysisResult.sessionId.slice(0, 8)} &rarr;
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
