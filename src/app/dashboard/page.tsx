import Link from 'next/link';
import './dashboard.css';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function Dashboard() {
  const learnerId = 'profile-1';

  // Seed fake history if none exists for demo
  const count = await prisma.misconceptionHistory.count({ where: { learnerId } });
  if (count === 0) {
    const progConcept = await prisma.concept.findFirst({ where: { name: 'Variables & Scope' }});
    const progMisc = await prisma.misconception.findFirst({ where: { name: 'Assignment vs Equality' }});
    
    if (progConcept && progMisc) {
      await prisma.masteryRecord.create({
        data: { learnerId, conceptId: progConcept.id, masteryLevel: 0.85 }
      });
      await prisma.misconceptionHistory.create({
        data: { learnerId, misconceptionId: progMisc.id, occurrences: 4, status: 'PERSISTING' }
      });
    }
  }

  const masteryRecords = await prisma.masteryRecord.findMany({
    where: { learnerId },
    include: { concept: true }
  });

  const history = await prisma.misconceptionHistory.findMany({
    where: { learnerId },
    include: { misconception: { include: { domain: true } } }
  });

  const overallMastery = masteryRecords.length > 0 
    ? Math.round((masteryRecords.reduce((sum, r) => sum + r.masteryLevel, 0) / masteryRecords.length) * 100)
    : 0;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <Link href="/" className="logo">Re:<span>Learn</span></Link>
        <Link href="/workspace" className="btn-primary">Continue Learning</Link>
      </header>

      <div className="dashboard-grid animate-fade-in">
        <div className="card glass col-span-4" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <h3>Overall Mastery</h3>
          <div className="mastery-score">{overallMastery}%</div>
          <div className="mastery-label">across all domains</div>
        </div>

        <div className="card glass col-span-8">
          <h3>Concept Mastery</h3>
          {masteryRecords.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)' }}>No mastery data yet. Complete some questions!</div>
          ) : (
            masteryRecords.map(r => (
              <div className="concept-bar" key={r.id}>
                <div className="bar-label">
                  <span>{r.concept.name}</span>
                  <span>{Math.round(r.masteryLevel * 100)}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${Math.round(r.masteryLevel * 100)}%` }}></div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card glass col-span-12">
          <h3>Active Misconceptions</h3>
          {history.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)' }}>No active misconceptions detected.</div>
          ) : (
            history.map(h => (
              <div className={`misconception-item ${h.status === 'RESOLVED' ? 'resolved' : ''}`} key={h.id}>
                <div>
                  <div className="m-title">{h.misconception.name}</div>
                  <div className="m-domain">{h.misconception.domain.name}</div>
                </div>
                <div className={`status-badge ${h.status === 'RESOLVED' ? 'status-resolved' : 'status-persisting'}`}>
                  {h.status} {h.status !== 'RESOLVED' && `(${h.occurrences} occurrences)`}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
