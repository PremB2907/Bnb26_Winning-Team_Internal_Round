import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database from ml/data/ (single source of truth)...");

  // Read taxonomy and question bank YAML
  const taxPath = path.join(process.cwd(), "ml/data/taxonomy.yaml");
  const qBankPath = path.join(process.cwd(), "ml/data/question_bank.yaml");

  const taxYaml = yaml.load(fs.readFileSync(taxPath, "utf-8")) as any;
  const qBankYaml = yaml.load(fs.readFileSync(qBankPath, "utf-8")) as any;

  // Create Domain
  const domain = await prisma.domain.upsert({
    where: { name: "Introductory Programming" },
    update: {},
    create: {
      name: "Introductory Programming",
      description: "Python 3 core concepts, control flow, functions, and data structures.",
    },
  });

  // Create Concepts & Misconceptions
  const conceptMap = new Map<string, string>();

  for (const m of taxYaml.misconceptions) {
    const conceptName = m.concept || "Core Syntax";
    let concept = await prisma.concept.findFirst({
      where: { domainId: domain.id, name: conceptName },
    });

    if (!concept) {
      concept = await prisma.concept.create({
        data: {
          domainId: domain.id,
          name: conceptName,
          description: `Concept covering ${conceptName}`,
        },
      });
    }
    conceptMap.set(conceptName, concept.id);

    await prisma.misconception.upsert({
      where: { id: m.id },
      update: {
        name: m.name,
        description: m.description,
        correctReasoning: m.correct_model,
        incorrectReasoningPatterns: JSON.stringify([m.bug_model]),
        triggerPatterns: JSON.stringify(m.common_surface_forms || []),
        severity: m.severity || "MEDIUM",
      },
      create: {
        id: m.id,
        domainId: domain.id,
        conceptId: concept.id,
        name: m.name,
        description: m.description,
        correctReasoning: m.correct_model,
        incorrectReasoningPatterns: JSON.stringify([m.bug_model]),
        triggerPatterns: JSON.stringify(m.common_surface_forms || []),
        severity: m.severity || "MEDIUM",
      },
    });

    // Create Intervention Templates per misconception
    const templateTypes = ["micro-explanation", "counterexample", "worked-example", "predict-then-run"];
    for (const tType of templateTypes) {
      const existingTpl = await prisma.interventionTemplate.findFirst({
        where: { misconceptionId: m.id, type: tType },
      });
      if (!existingTpl) {
        await prisma.interventionTemplate.create({
          data: {
            misconceptionId: m.id,
            type: tType,
            content: `Intervention (${tType}): ${m.correct_model}. Contrast with bug: ${m.bug_model}`,
          },
        });
      }
    }
  }

  // Create Questions
  const defaultConceptId = Array.from(conceptMap.values())[0];
  for (const q of qBankYaml.questions) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {
        content: q.prompt,
        expectedAnswer: q.correct_output,
        type: q.question_type || "CODE",
        isDiscriminatingFor: JSON.stringify(q.predictions || {}),
      },
      create: {
        id: q.id,
        conceptId: defaultConceptId,
        content: q.prompt,
        expectedAnswer: q.correct_output,
        type: q.question_type || "CODE",
        isDiscriminatingFor: JSON.stringify(q.predictions || {}),
      },
    });
  }

  // Create Demo User & LearnerProfile
  const user = await prisma.user.upsert({
    where: { email: "learner@relearn.edu" },
    update: {},
    create: {
      email: "learner@relearn.edu",
      name: "Alice Learner",
    },
  });

  await prisma.learnerProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
