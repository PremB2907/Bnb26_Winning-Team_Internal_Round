import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function generate() {
  const misconceptions = await prisma.misconception.findMany({
    include: { concept: { include: { questions: true } }, domain: true }
  });

  const dataset: any[] = [];
  
  // 1. Exact Match Cases (1 per misconception = 45 cases)
  for (const m of misconceptions) {
    const triggers = JSON.parse(m.triggerPatterns || '[]');
    const q = m.concept.questions.find(q => q.isDiscriminatingFor === null && q.isVerificationFor === null);
    
    if (q && triggers.length > 0) {
      dataset.push({
        id: `eval_exact_${m.id}`,
        domain: m.domain.name,
        questionId: q.id,
        questionContent: q.content,
        expectedAnswer: q.expectedAnswer,
        learnerResponse: triggers[0], // Direct trigger match
        groundTruthMisconception: m.id,
        expectedStatus: 'DIAGNOSED',
        type: 'EXACT'
      });
    }
  }

  // 2. Ambiguous Cases (5 cases)
  for (let i = 0; i < 5; i++) {
    const m1 = misconceptions[i];
    const m2 = misconceptions[i+1];
    if (m1 && m2 && m1.domainId === m2.domainId) {
      const q = m1.concept.questions[0];
      const t1 = JSON.parse(m1.triggerPatterns)[0];
      const t2 = JSON.parse(m2.triggerPatterns)[0];
      if (q && t1 && t2) {
        dataset.push({
          id: `eval_amb_${i}`,
          domain: m1.domain.name,
          questionId: q.id,
          questionContent: q.content,
          expectedAnswer: q.expectedAnswer,
          learnerResponse: `${t1} and also ${t2}`,
          groundTruthMisconception: null,
          expectedStatus: 'AMBIGUOUS',
          type: 'AMBIGUOUS'
        });
      }
    }
  }

  const garbageResponses = ['I don\'t know', 'Can you explain it?', 'This is too hard', 'Just tell me the answer', 'Turtles are cool'];
  for (let i = 0; i < 5; i++) {
    const m = misconceptions[i+10];
    if (m) {
      const q = m.concept.questions[0];
      dataset.push({
        id: `eval_novel_${i}`,
        domain: m.domain.name,
        questionId: q.id,
        questionContent: q.content,
        expectedAnswer: q.expectedAnswer,
        learnerResponse: garbageResponses[i],
        groundTruthMisconception: null,
        expectedStatus: 'NOVEL_OR_UNCERTAIN',
        type: 'NOVEL'
      });
    }
  }

  fs.writeFileSync(path.join(__dirname, 'dataset.json'), JSON.stringify(dataset, null, 2));
  console.log(`Generated ${dataset.length} evaluation cases.`);
}

generate().catch(console.error).finally(() => prisma.$disconnect());
