'use client';

import Link from 'next/link';
import './dashboard.css';

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <Link href="/" className="logo">Re:<span>Learn</span></Link>
        <Link href="/workspace" className="btn-primary">Continue Learning</Link>
      </header>

      <div className="dashboard-grid animate-fade-in">
        <div className="card glass col-span-4" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <h3>Overall Mastery</h3>
          <div className="mastery-score">68%</div>
          <div className="mastery-label">across all domains</div>
        </div>

        <div className="card glass col-span-8">
          <h3>Concept Mastery</h3>
          
          <div className="concept-bar">
            <div className="bar-label">
              <span>Variables & Assignment</span>
              <span>85%</span>
            </div>
            <div className="bar-track"><div className="bar-fill" style={{ width: '85%' }}></div></div>
          </div>
          
          <div className="concept-bar">
            <div className="bar-label">
              <span>Boolean Logic</span>
              <span>42%</span>
            </div>
            <div className="bar-track"><div className="bar-fill" style={{ width: '42%' }}></div></div>
          </div>
          
          <div className="concept-bar">
            <div className="bar-label">
              <span>Loops & Iteration</span>
              <span>70%</span>
            </div>
            <div className="bar-track"><div className="bar-fill" style={{ width: '70%' }}></div></div>
          </div>
        </div>

        <div className="card glass col-span-12">
          <h3>Active Misconceptions</h3>
          
          <div className="misconception-item">
            <div>
              <div className="m-title">Condition Inversion</div>
              <div className="m-domain">Programming • Boolean Logic</div>
            </div>
            <div className="status-badge status-persisting">PERSISTING (4 occurrences)</div>
          </div>
          
          <div className="misconception-item">
            <div>
              <div className="m-title">Assignment vs Equality</div>
              <div className="m-domain">Programming • Variables</div>
            </div>
            <div className="status-badge status-persisting">PARTIALLY RESOLVED</div>
          </div>
          
          <div className="misconception-item resolved">
            <div>
              <div className="m-title">Off-by-One Indexing</div>
              <div className="m-domain">Programming • Arrays</div>
            </div>
            <div className="status-badge status-resolved">RESOLVED</div>
          </div>
        </div>
      </div>
    </div>
  );
}
