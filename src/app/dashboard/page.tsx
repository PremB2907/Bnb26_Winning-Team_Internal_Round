import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await prisma.user.findFirst({
    where: { email: "learner@relearn.edu" },
    include: { learnerProfile: true },
  });

  const learnerId = user?.learnerProfile?.id;

  const histories = learnerId
    ? await prisma.misconceptionHistory.findMany({
        where: { learnerId },
        include: { misconception: true },
      })
    : [];

  const masteries = learnerId
    ? await prisma.masteryRecord.findMany({
        where: { learnerId },
        include: { concept: true },
      })
    : [];

  const recentSessions = learnerId
    ? await prisma.learningSession.findMany({
        where: { learnerId },
        orderBy: { startTime: "desc" },
        take: 10,
        include: { question: true, diagnoses: true, verification: true },
      })
    : [];

  return (
    <div style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto", color: "#f8fafc", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid #334155", paddingBottom: "1rem" }}>
        <h2>Learner Model Dashboard <small style={{ fontSize: "14px", color: "#38bdf8" }}>(Alice Learner)</small></h2>
        <div>
          <Link href="/learn" style={{ marginRight: "1rem", color: "#94a3b8" }}>Learn</Link>
          <Link href="/lab" style={{ color: "#94a3b8" }}>Eval Lab</Link>
        </div>
      </header>

      <div style={{ background: "#1e293b", border: "1px solid #3b82f6", borderRadius: "6px", padding: "0.75rem 1rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "#93c5fd" }}>
        <strong>Data Source Banner:</strong> Real Learner Database Persistence | Querying live SQLite / Prisma <code>dev.db</code> tables.
      </div>

      {/* Concept Mastery Records */}
      <section style={{ marginBottom: "2rem" }}>
        <h3>Concept Mastery Levels (DB Persisted)</h3>
        {masteries.length === 0 ? (
          <p style={{ color: "#64748b" }}>No mastery records stored yet. Complete a learning problem to build history.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
            {masteries.map((m) => (
              <div key={m.id} style={{ background: "#0f172a", padding: "1rem", borderRadius: "6px", border: "1px solid #1e293b" }}>
                <h4 style={{ margin: "0 0 0.5rem 0", color: "#38bdf8" }}>{m.concept.name}</h4>
                <div style={{ background: "#1e293b", height: "10px", borderRadius: "5px", overflow: "hidden" }}>
                  <div style={{ width: `${m.masteryLevel * 100}%`, background: "#10b981", height: "100%" }} />
                </div>
                <span style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginTop: "0.5rem" }}>
                  Mastery: {(m.masteryLevel * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Misconception History */}
      <section style={{ marginBottom: "2rem" }}>
        <h3>Misconception Tracking & Recurrence</h3>
        {histories.length === 0 ? (
          <p style={{ color: "#64748b" }}>No persistent misconceptions recorded.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#0f172a", border: "1px solid #1e293b", borderRadius: "6px" }}>
            <thead>
              <tr style={{ background: "#1e293b", textAlign: "left" }}>
                <th style={{ padding: "0.8rem" }}>Misconception</th>
                <th style={{ padding: "0.8rem" }}>Occurrences</th>
                <th style={{ padding: "0.8rem" }}>BKT Status</th>
                <th style={{ padding: "0.8rem" }}>Last Encountered</th>
              </tr>
            </thead>
            <tbody>
              {histories.map((h) => (
                <tr key={h.id} style={{ borderTop: "1px solid #1e293b" }}>
                  <td style={{ padding: "0.8rem" }}>
                    <strong>{h.misconception.name}</strong> (`{h.misconception.id}`)
                  </td>
                  <td style={{ padding: "0.8rem" }}>{h.occurrences}</td>
                  <td style={{ padding: "0.8rem", color: h.status === "RESOLVED" ? "#10b981" : "#f59e0b" }}>{h.status}</td>
                  <td style={{ padding: "0.8rem" }}>{new Date(h.lastEncountered).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Recent Learning Sessions */}
      <section>
        <h3>Recent Learning Sessions</h3>
        {recentSessions.length === 0 ? (
          <p style={{ color: "#64748b" }}>No sessions recorded.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {recentSessions.map((s) => (
              <div key={s.id} style={{ background: "#0f172a", padding: "1rem", borderRadius: "6px", border: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>Session {s.id.slice(0, 8)}</strong> - Question `{s.questionId}`
                  <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>
                    {new Date(s.startTime).toLocaleString()}
                  </span>
                </div>
                <Link href={`/trace/${s.id}`} style={{ color: "#38bdf8", textDecoration: "none" }}>
                  View Trace &rarr;
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
