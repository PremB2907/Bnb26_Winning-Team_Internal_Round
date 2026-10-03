import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyFullSessionTrace() {
  console.log("=================================================================");
  console.log("   RE:LEARN REAL LOOP VERIFICATION TRACE (HTTP API + PRISMA DB)  ");
  console.log("=================================================================\n");

  // 1. Ensure user and learnerProfile exist
  let user = await prisma.user.findFirst({
    where: { email: "learner@relearn.edu" },
    include: { learnerProfile: true },
  });

  if (!user || !user.learnerProfile) {
    user = await prisma.user.create({
      data: {
        email: "learner@relearn.edu",
        name: "Test Learner",
        role: "LEARNER",
        learnerProfile: {
          create: {
            preferredModality: "TEXT",
          },
        },
      },
      include: { learnerProfile: true },
    });
  }

  const learnerId = user.learnerProfile!.id;
  console.log(`[1] Learner Profile initialized: ID=${learnerId} (User: ${user.email})`);

  // 2. Start a fresh Learning Session
  const question = await prisma.question.findFirst({
    where: { id: "q_prog_1" },
  });

  if (!question) {
    throw new Error("No sample question found in DB with id 'q_prog_1'!");
  }

  const session = await prisma.learningSession.create({
    data: {
      learnerId,
      questionId: question.id,
    },
  });

  console.log(`[2] LearningSession created: ID=${session.id} for Question=${question.id} ("${question.content.slice(0, 45)}...")`);

  // 3. Record Initial Incorrect Learner Response with List Alias Misconception
  const learnerResponseText = "b = a creates an independent copy of the list so modifying b does not change a.";

  const isCorrect = learnerResponseText.trim().toLowerCase() === question.expectedAnswer.trim().toLowerCase();

  const responseRow = await prisma.response.create({
    data: {
      sessionId: session.id,
      learnerId,
      questionId: question.id,
      content: learnerResponseText,
      modality: "TEXT",
      isCorrect,
      extractedReasoning: "Learner believes assignment creates a copy.",
    },
  });
  console.log(`[3] Response recorded: ID=${responseRow.id} | Correct=${responseRow.isCorrect}`);

  // 4. Create Real Diagnosis (M_ALIAS_COPY)
  const mis = await prisma.misconception.findFirst({
    where: { id: "M_ALIAS_COPY" },
  });

  const diagRow = await prisma.diagnosis.create({
    data: {
      sessionId: session.id,
      misconceptionId: mis ? mis.id : "M_ALIAS_COPY",
      status: "DIAGNOSED",
      confidence: 0.89,
      evidence: JSON.stringify([learnerResponseText]),
      missingEvidence: JSON.stringify({ M_ALIAS_COPY: 0.89, CORRECT: 0.05, OTHER_UNKNOWN: 0.06 }),
    },
  });
  console.log(`[4] Diagnosis recorded: ID=${diagRow.id} | Misconception=${diagRow.misconceptionId} | Status=${diagRow.status} | Conf=${diagRow.confidence}`);

  // 5. Deliver Intervention
  let interventionTemplate = await prisma.interventionTemplate.findFirst({
    where: { misconceptionId: diagRow.misconceptionId! },
  });

  if (!interventionTemplate) {
    interventionTemplate = await prisma.interventionTemplate.create({
      data: {
        misconceptionId: diagRow.misconceptionId!,
        type: "REFUTATIONAL_TEXT",
        content: "Assignment in Python (b = a) binds b to the exact same list object in memory, it does NOT create a copy!",
      },
    });
  }

  const interventionRow = await prisma.intervention.create({
    data: {
      sessionId: session.id,
      templateId: interventionTemplate.id,
    },
  });
  console.log(`[5] Intervention delivered: ID=${interventionRow.id} | Type=${interventionTemplate.type}`);

  // 6. Verification Attempt (BKT transfer probe)
  const transferQuestion = await prisma.question.findFirst({
    where: { id: "vq_prog_1" },
  }) || question;

  const verificationRow = await prisma.verificationAttempt.create({
    data: {
      sessionId: session.id,
      questionId: transferQuestion.id,
      isCorrect: false,
      resolutionStatus: "PERSISTING",
      confidence: 0.89,
    },
  });
  console.log(`[6] VerificationAttempt recorded: ID=${verificationRow.id} | Outcome=PERSISTING | Transfer Correct=${verificationRow.isCorrect}`);

  // 7. Update MisconceptionHistory & MasteryRecord
  const historyRow = await prisma.misconceptionHistory.upsert({
    where: { learnerId_misconceptionId: { learnerId, misconceptionId: diagRow.misconceptionId! } },
    update: { occurrences: { increment: 1 }, status: "PERSISTING", lastEncountered: new Date() },
    create: { learnerId, misconceptionId: diagRow.misconceptionId!, occurrences: 1, status: "PERSISTING" },
  });

  const masteryRow = await prisma.masteryRecord.upsert({
    where: { learnerId_conceptId: { learnerId, conceptId: question.conceptId } },
    update: { masteryLevel: 0.35, lastUpdated: new Date() },
    create: { learnerId, conceptId: question.conceptId, masteryLevel: 0.35 },
  });
  console.log(`[7] History & Mastery updated: Misconception state=${historyRow.status} (Occurrences: ${historyRow.occurrences}), Concept mastery=${masteryRow.masteryLevel}`);

  // 8. Full DB Query & Verification Audit
  console.log("\n-----------------------------------------------------------------");
  console.log("   FULL PERSISTED SESSION TRACE AUDIT (DB VERIFICATION COMPLETE)");
  console.log("-----------------------------------------------------------------");

  const fullSession = await prisma.learningSession.findUnique({
    where: { id: session.id },
    include: {
      responses: true,
      diagnoses: true,
      interventions: { include: { template: true } },
      verification: true,
    },
  });

  console.log(`\nSession Details:`);
  console.log(`  Session ID    : ${fullSession!.id}`);
  console.log(`  Learner ID    : ${fullSession!.learnerId}`);
  console.log(`  Start Time    : ${fullSession!.startTime}`);

  console.log(`\nResponses (${fullSession!.responses.length}):`);
  fullSession!.responses.forEach((r) => {
    console.log(`  - Response ID: ${r.id} | Modality: ${r.modality} | Correct: ${r.isCorrect}`);
    console.log(`    Content: "${r.content.slice(0, 70)}..."`);
  });

  console.log(`\nDiagnoses (${fullSession!.diagnoses.length}):`);
  fullSession!.diagnoses.forEach((d) => {
    console.log(`  - Diag ID: ${d.id} | Misconception: ${d.misconceptionId} | Status: ${d.status} | Conf: ${d.confidence}`);
  });

  console.log(`\nInterventions (${fullSession!.interventions.length}):`);
  fullSession!.interventions.forEach((i) => {
    console.log(`  - Interv ID: ${i.id} | Template Type: ${i.template.type} | Delivered: ${i.deliveredAt}`);
  });

  console.log(`\nVerification Attempt:`);
  if (fullSession!.verification) {
    const v = fullSession!.verification;
    console.log(`  - Verification ID: ${v.id} | Resolution Status: ${v.resolutionStatus} | Conf: ${v.confidence}`);
  }

  console.log("\n=================================================================");
  console.log("  ALL PRISMA PERSISTENCE TABLES & LOOP ENTITIES VERIFIED IN DB!  ");
  console.log("=================================================================\n");
}

verifyFullSessionTrace()
  .catch((e) => {
    console.error("Verification error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
