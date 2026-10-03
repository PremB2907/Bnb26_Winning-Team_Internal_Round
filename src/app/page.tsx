'use client';

import Link from 'next/link';
import './home.css';

export default function Home() {
  return (
    <div className="home-container">
      <nav className="navbar glass">
        <div className="logo">Re:<span>Learn</span> <small style={{fontSize: '12px', opacity: 0.8, color: '#38bdf8'}}>(Python Domain)</small></div>
        <div className="nav-links">
          <Link href="/learn">Learn</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/lab">Eval Lab</Link>
          <Link href="/contribute">Contribute</Link>
          <Link href="/learn" className="btn-primary">Launch Environment</Link>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-content animate-fade-in">
          <h1 className="hero-title">
            Adaptive Misconception Diagnosis<br/>
            <span className="text-gradient">For Python Novices.</span>
          </h1>
          <p className="hero-subtitle">
            Re:Learn distinguishes between different programming misconceptions that produce similar incorrect answers using Bayesian belief modeling, Expected Information Gain (EIG) active probing, and BKT resolution evaluation.
          </p>
          <div className="hero-cta">
            <Link href="/learn" className="btn-primary btn-large">Start Interactive Session</Link>
            <Link href="/lab" className="btn-secondary btn-large">View Evaluation Benchmarks</Link>
          </div>
        </div>
      </header>

      <section className="pipeline-section">
        <h2 className="section-title">The Scientific Pipeline</h2>
        <div className="pipeline-container">
          <div className="pipeline-step glass">
            <div className="step-number">1</div>
            <h3>Outcome Mapping</h3>
            <p>Executes learner code & maps response to buggy mental models.</p>
          </div>
          <div className="pipeline-arrow">→</div>
          <div className="pipeline-step glass">
            <div className="step-number">2</div>
            <h3>Bayesian Diagnosis</h3>
            <p>Updates P(M | evidence) over 12 Python misconceptions.</p>
          </div>
          <div className="pipeline-arrow">→</div>
          <div className="pipeline-step glass">
            <div className="step-number">3</div>
            <h3>EIG Active Probing</h3>
            <p>Selects probes that maximize expected information gain.</p>
          </div>
          <div className="pipeline-arrow">→</div>
          <div className="pipeline-step glass">
            <div className="step-number">4</div>
            <h3>Targeted Intervention</h3>
            <p>Delivers grounded micro-explanations or counterexamples.</p>
          </div>
          <div className="pipeline-arrow">→</div>
          <div className="pipeline-step glass">
            <div className="step-number">5</div>
            <h3>BKT Verification</h3>
            <p>Requires &ge;2 discriminating transfer probes before marking resolved.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
