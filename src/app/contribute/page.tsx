'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContributePage() {
  const [questionId, setQuestionId] = useState('q_alias_1');
  const [finalAnswer, setFinalAnswer] = useState('');
  const [workingText, setWorkingText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: '#f8fafc', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
        <Link href="/learn" style={{ color: '#38bdf8', textDecoration: 'none' }}>&larr; Back to Learn</Link>
        <h2 style={{ marginTop: '1rem' }}>Peer Dataset Contribution <small style={{ fontSize: '14px', color: '#10b981' }}>(Human Held-Out Test Set)</small></h2>
      </header>

      {submitted ? (
        <div style={{ background: '#064e3b', padding: '1.5rem', borderRadius: '8px', border: '1px solid #065f46' }}>
          <h3>Thank you for contributing!</h3>
          <p>Your response has been logged into the human held-out evaluation test set (`test_human`).</p>
          <button onClick={() => setSubmitted(false)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '4px', cursor: 'pointer' }}>
            Submit Another Response
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '8px', border: '1px solid #1e293b' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Question:</label>
          <select
            value={questionId}
            onChange={(e) => setQuestionId(e.target.value)}
            style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}
          >
            <option value="q_alias_1">q_alias_1: a = [1, 2, 3]; b = a; b.append(4); print(a)</option>
            <option value="q_print_ret_1">q_print_ret_1: def add(a, b): print(a + b); res = add(2, 3); print(res)</option>
            <option value="q_or_1">q_or_1: x = 5; if x == 1 or 2: print('Yes') else: print('No')</option>
            <option value="q_range_1">q_range_1: nums = list(range(1, 5)); print(nums)</option>
          </select>

          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Your Output Answer:</label>
          <input
            type="text"
            value={finalAnswer}
            onChange={(e) => setFinalAnswer(e.target.value)}
            required
            placeholder="e.g. [1, 2, 3]"
            style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}
          />

          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Your Natural Explanation / Working:</label>
          <textarea
            value={workingText}
            onChange={(e) => setWorkingText(e.target.value)}
            required
            rows={4}
            placeholder="Explain why you think this is the answer..."
            style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '4px' }}
          />

          <button type="submit" style={{ background: '#0284c7', color: '#fff', padding: '0.8rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Submit Human Response
          </button>
        </form>
      )}
    </div>
  );
}
