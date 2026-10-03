'use client';

import Link from 'next/link';
import './home.css';

export default function Home() {
  return (
    <div className="home-container">
      <nav className="navbar glass">
        <div className="logo">Re:<span>Learn</span></div>
        <div className="nav-links">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/workspace" className="btn-primary">Start Learning</Link>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-content animate-fade-in">
          <h1 className="hero-title">
            Don't just detect wrong answers.<br/>
            <span className="text-gradient">Understand why.</span>
          </h1>
          <p className="hero-subtitle">
            Re:Learn is an adaptive learning environment that diagnoses your underlying misconceptions, provides targeted interventions, and verifies your understanding.
          </p>
          <div className="hero-cta">
            <Link href="/workspace" className="btn-primary btn-large">Start Learning</Link>
            <Link href="/demo" className="btn-secondary btn-large">Explore How It Works</Link>
          </div>
        </div>
      </header>

      <section className="pipeline-section">
        <h2 className="section-title">The Re:Learn Pipeline</h2>
        <div className="pipeline-container">
          <div className="pipeline-step glass">
            <div className="step-number">1</div>
            <h3>Answer</h3>
            <p>Submit your response via text, code, or image.</p>
          </div>
          <div className="pipeline-arrow">→</div>
          <div className="pipeline-step glass">
            <div className="step-number">2</div>
            <h3>Diagnose</h3>
            <p>We analyze your reasoning to find the root misconception.</p>
          </div>
          <div className="pipeline-arrow">→</div>
          <div className="pipeline-step glass">
            <div className="step-number">3</div>
            <h3>Intervene</h3>
            <p>Receive a targeted micro-explanation or analogy.</p>
          </div>
          <div className="pipeline-arrow">→</div>
          <div className="pipeline-step glass">
            <div className="step-number">4</div>
            <h3>Verify</h3>
            <p>Solve a new question to prove the misconception is resolved.</p>
          </div>
          <div className="pipeline-arrow">→</div>
          <div className="pipeline-step glass">
            <div className="step-number">5</div>
            <h3>Adapt</h3>
            <p>Your learner model updates and the curriculum adapts.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
