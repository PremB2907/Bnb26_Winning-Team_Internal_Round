import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function TracePage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = await params;
  const session = await prisma.learningSession.findUnique({
    where: { id: resolvedParams.sessionId },
    include: {
      question: true,
      responses: true,
      diagnoses: { include: { misconception: true } },
      interventions: { include: { template: true } },
      verification: true,
    },
  });

  if (!session) {
    return notFound();
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto", color: "#f8fafc", fontFamily: "sans-serif" }}>
      <header style={{ marginBottom: "2rem", borderBottom: "1px solid #334155", paddingBottom: "1rem" }}>
        <Link href="/learn" style={{ color: "#38bdf8", textDecoration: "none" }}>&larr; Back to Learning Workspace</Link>
        <h2 style={{ marginTop: "1rem" }}>Session Trace Timeline <small style={{ fontSize: "14px", color: "#64748b" }}>({session.id})</small></h2>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Step 1: Question */}
        <div style={{ background: "#0f172a", padding: "1.5rem", borderRadius: "8px", border: "1px solid #1e293b" }}>
          <h3 style={{ color: "#38bdf8" }}>Step 1: Submitted Problem</h3>
          <p style={{ fontFamily: "monospace", background: "#1e293b", padding: "1rem", borderRadius: "4px" }}>
            {session.question.content}
          </p>
        </div>

        {/* Step 2: Learner Response */}
        {session.responses.map((r) => (
          <div key={r.id} style={{ background: "#0f172a", padding: "1.5rem", borderRadius: "8px", border: "1px solid #1e293b" }}>
            <h3 style={{ color: "#f59e0b" }}>Step 2: Learner Submission</h3>
            <p><strong>Response Content:</strong> {r.content}</p>
            <p><strong>Extracted Reasoning:</strong> {r.extractedReasoning || "None"}</p>
            <p><strong>Is Correct Answer:</strong> {r.isCorrect ? "True" : "False"}</p>
          </div>
        ))}

        {/* Step 3: Diagnosis */}
        {session.diagnoses.map((d) => (
          <div key={d.id} style={{ background: "#0f172a", padding: "1.5rem", borderRadius: "8px", border: "1px solid #1e293b" }}>
            <h3 style={{ color: "#ef4444" }}>Step 3: ML Engine Diagnosis</h3>
            <p><strong>Diagnosed Misconception:</strong> {d.misconception ? `${d.misconception.name} (${d.misconception.id})` : "None"}</p>
            <p><strong>Confidence Score:</strong> {(d.confidence * 100).toFixed(1)}%</p>
            <p><strong>Status:</strong> {d.status}</p>
            <p><strong>Evidence Spans:</strong> {d.evidence}</p>
          </div>
        ))}

        {/* Step 4: Delivered Intervention */}
        {session.interventions.map((i) => (
          <div key={i.id} style={{ background: "#0f172a", padding: "1.5rem", borderRadius: "8px", border: "1px solid #1e293b" }}>
            <h3 style={{ color: "#10b981" }}>Step 4: Targeted Intervention</h3>
            <p><strong>Template Type:</strong> {i.template.type}</p>
            <p><strong>Delivered Content:</strong> {i.template.content}</p>
          </div>
        ))}

        {/* Step 5: BKT Resolution Verification */}
        {session.verification && (
          <div style={{ background: "#0f172a", padding: "1.5rem", borderRadius: "8px", border: "1px solid #1e293b" }}>
            <h3 style={{ color: "#a855f7" }}>Step 5: BKT Resolution State</h3>
            <p><strong>Resolution Status:</strong> {session.verification.resolutionStatus}</p>
            <p><strong>Confidence:</strong> {(session.verification.confidence * 100).toFixed(1)}%</p>
          </div>
        )}
      </div>
    </div>
  );
}
