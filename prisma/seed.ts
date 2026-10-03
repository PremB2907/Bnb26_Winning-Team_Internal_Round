import { PrismaClient } from '@prisma/client';
import { programmingConcepts, programmingMisconceptions } from './seedData/programming';
import { algebraConcepts, algebraMisconceptions } from './seedData/algebra';
import { physicsConcepts, physicsMisconceptions } from './seedData/physics';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clear old data
  await prisma.verificationAttempt.deleteMany();
  await prisma.intervention.deleteMany();
  await prisma.diagnosis.deleteMany();
  await prisma.response.deleteMany();
  await prisma.learningSession.deleteMany();
  await prisma.misconceptionHistory.deleteMany();
  await prisma.masteryRecord.deleteMany();
  
  await prisma.interventionTemplate.deleteMany();
  await prisma.question.deleteMany();
  await prisma.misconception.deleteMany();
  await prisma.concept.deleteMany();
  await prisma.domain.deleteMany();
  
  await prisma.learnerProfile.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const user = await prisma.user.create({
    data: {
      id: 'demo-user',
      email: 'demo@relearn.ai',
      name: 'Demo Learner',
      learnerProfile: {
        create: {
          id: 'profile-1'
        }
      }
    }
  });

  const domainsData = [
    { name: 'programming', description: 'Computer Science & Coding', concepts: programmingConcepts, misconceptions: programmingMisconceptions },
    { name: 'algebra', description: 'Mathematics & Algebra', concepts: algebraConcepts, misconceptions: algebraMisconceptions },
    { name: 'physics', description: 'Classical Physics', concepts: physicsConcepts, misconceptions: physicsMisconceptions }
  ];

  for (const dom of domainsData) {
    const domain = await prisma.domain.create({
      data: { name: dom.name, description: dom.description }
    });

    for (const c of dom.concepts) {
      await prisma.concept.create({
        data: {
          id: c.id,
          domainId: domain.id,
          name: c.name,
          description: c.description
        }
      });
    }

    for (const m of dom.misconceptions) {
      await prisma.misconception.create({
        data: {
          id: m.id,
          domainId: domain.id,
          conceptId: m.conceptId,
          name: m.name,
          description: m.description,
          correctReasoning: m.correctReasoning,
          incorrectReasoningPatterns: m.incorrectReasoningPatterns,
          triggerPatterns: m.triggerPatterns,
          severity: m.severity,
          interventions: {
            create: m.interventions.map(i => ({
              type: i.type,
              content: i.content
            }))
          }
        }
      });
      
      for (const q of m.questions) {
        await prisma.question.create({
          data: {
            id: q.id,
            conceptId: m.conceptId,
            type: q.type,
            content: q.content,
            expectedAnswer: q.expectedAnswer,
            isDiscriminatingFor: q.isDiscriminatingFor,
            isVerificationFor: q.isVerificationFor
          }
        });
      }
    }
  }

  console.log('Seeding complete. 45 misconceptions loaded.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
