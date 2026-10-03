'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ReviewPage() {
  const [samples, setSamples] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);

  useEffect(() => {
    // Fetch dataset samples for review
    fetch('/api/questions')
      .then((res) => res.json())
      .then(() => {
        // Mock sample set for review UI demonstration
        setSamples([
          {
            id: 'sub_0001',
            question_id: 'q_alias_1',
            working_text: 'Assigning b = a creates a new duplicate list so a stays [1, 2, 3].',
            learner_code: 'b = a',
            label: 'M_ALIAS_COPY',
            source: 'llm_generated',
            verified: null
          },
          {
            id: 'sub_0002',
            question_id: 'q_print_ret_1',
            working_text: 'add(2, 3) prints 5 so res stores 5.',
            learner_code: 'res = add(2, 3)',
            label: 'M_PRINT_IS_RETURN',
            source: 'llm_generated',
            verified: null
          }
        ]);
      });
  }, []);

  const currentItem = samples[currentIndex];

  const handleVerify = (verified: boolean) => {
    if (currentItem) {
      currentItem.verified = verified;
      setReviewedCount((prev) => prev + 1);
      if (currentIndex < samples.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '850px', margin: '0 auto', color: '#f8fafc', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
        <h2>Dataset Verification & Label Review <small style={{ fontSize: '14px', color: '#10b981' }}>(Reviewed: {reviewedCount})</small></h2>
        <Link href="/learn" style={{ color: '#38bdf8', textDecoration: 'none' }}>&larr; Back to Learn</Link>
      </header>

      {currentItem ? (
        <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '8px', border: '1px solid #1e293b' }}>
          <p><strong>Submission ID:</strong> `{currentItem.id}` | <strong>Question:</strong> `{currentItem.question_id}`</p>
          <p><strong>Source:</strong> `{currentItem.source}` | <strong>Current Label:</strong> <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{currentItem.label}</span></p>

          <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '6px', margin: '1rem 0' }}>
            <p><strong>Learner Working Text:</strong></p>
            <p style={{ fontStyle: 'italic', color: '#cbd5e1' }}>"{currentItem.working_text}"</p>
            <p><strong>Learner Code:</strong></p>
            <pre style={{ background: '#090d16', padding: '0.8rem', borderRadius: '4px', color: '#38bdf8' }}>{currentItem.learner_code}</pre>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button onClick={() => handleVerify(true)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Verify Label (verified: true)
            </button>
            <button onClick={() => handleVerify(false)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Reject / Label Noise (verified: false)
            </button>
          </div>
        </div>
      ) : (
        <p>No items remaining for review.</p>
      )}
    </div>
  );
}
