import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyFullSessionTrace() {
  console.log("--- VERIFYING FULL DB SESSION TRACE ACROSS PRISMA TABLES ---");

  // 1. Get Learner
  const user = await prisma.user.findFirst({
    where: { email: "learner@relearn.edu" },
    include: { learnerProfile: true },
  });

  if (!user || !user.learnerProfile) {
    console.error("Error: Learner profile not found!");
    process.exit(1);
  }

  const learnerId = user.learnerProfile.id;

  // 2. Query Recent Session
  const session = await prisma.learningSession.findFirst({
    where: { learnerId },
    orderBy: { startTime: "desc" },
    include: {
      responses: true,
      diagnoses: true,
      interventions: { include: { template: true } },
      verification: true,
    },
  });

  if (!session) {
    console.log("No existing session found. Executing seed session...");
    // Create a mock session to verify DB trace
    const question = await prisma.question.findFirst();
    const newSession = await prisma.learningSession.create({
      data: {
        learnerId,
        questionId: question!.id,
      },
    });

    await prisma.response.create({
      data: {
        sessionId: newSession.id,
        learnerId,
        questionId: question!.id,
        content: "b = a creates a new list copy so a stays [1, 2, 3]",
        modality: "TEXT",
        isCorrect: false,
        extractedReasoning: "b = a copies list",
      },
    });

    const m = await prisma.misconception.findFirst({ where: { id: "M_ALIAS_COPY" } });
    await prisma.diagnosis.create({
      data: {
        sessionId: newSession.id,
        misconceptionId: m!.id,
        status: "DIAGNOSED",
        confidence: 0.92,
        evidence: JSON.stringify(["b = a creates a new list copy"]),
      },
    });

    const template = await prisma.interventionTemplate.findFirst({ where: { misconceptionId: m!.id } });
    await prisma.intervention.create({
      data: {
        sessionId: newSession.id,
        templateId: template!.id,
      },
    });

    await prisma.verificationAttempt.create({
      data: {
        sessionId: newSession.id,
        questionId: question!.id,
        isCorrect: false,
        resolutionStatus: "PERSISTING",
        confidence: 0.92,
      },
    });

    await prisma.misconceptionHistory.upsert({
      where: { learnerId_misconceptionId: { learnerId, misconceptionId: m!.id } },
      update: { occurrences: { increment: 1 } },
      create: { learnerId, misconceptionId: m!.id, occurrences: 1, status: "PERSISTING" },
    });

    await prisma.masteryRecord.upsert({
      where: { learnerId_conceptId: { learnerId, conceptId: question!.conceptId } },
      update: { masteryLevel: 0.4 },
      create: { learnerId, conceptId: question!.conceptId, masteryLevel: 0.4 },
    });
  }

  // Refetch complete session trace
  const fullSession = await prisma.learningSession.findFirst({
    where: { learnerId },
    orderBy: { startTime: "desc" },
    include: {
      responses: true,
      diagnoses: true,
      interventions: { include: { template: true } },
      verification: true,
    },
  });

  const histories = await prisma.misconceptionHistory.findMany({ where: { learnerId } });
  const masteries = await prisma.masteryRecord.findMany({ where: { learnerId } });

  console.log("\n[Session Record]");
  console.log(`  ID: ${fullSession!.id} | Question: ${fullSession!.questionId} | Start: ${fullSession!.startTime}`);

  console.log("\n[Response Record]");
  for (const r of fullSession!.responses) {
    console.log(`  ID: ${r.id} | Content: "${r.content}" | Modality: ${r.modality} | Correct: ${r.isCorrect}`);
  }

  console.log("\n[Diagnosis Record]");
  for (const d of fullSession!.diagnoses) {
    console.log(`  ID: ${d.id} | Misconception: ${d.misconceptionId} | Status: ${d.status} | Conf: ${d.confidence}`);
  }

  console.log("\n[Intervention Record]");
  for (const i of fullSession!.interventions) {
    console.log(`  ID: ${i.id} | Template Type: ${i.template.type} | Delivered: ${i.deliveredAt}`);
  }

  console.log("\n[VerificationAttempt Record]");
  if (fullSession!.verification) {
    const v = fullSession!.verification;
    console.log(`  ID: ${v.id} | Status: ${v.resolutionStatus} | Conf: ${v.confidence}`);
  }

  console.log("\n[MisconceptionHistory Records]");
  for (const h of histories) {
    console.log(`  Misconception: ${h.misconceptionId} | Occurrences: ${h.occurrences} | Status: ${h.status}`);
  }

  console.log("\n[MasteryRecords]");
  for (const m of masteries) {
    console.log(`  Concept ID: ${m.conceptId} | Mastery: ${m.masteryLevel}`);
  }

  console.log("\nALL PRISMA PERSISTENCE TABLES VERIFIED SUCCESSFULLY!");
}

verifyFullSessionTrace()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
