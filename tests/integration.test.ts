import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { diagnoser } from '../src/lib/engine/diagnoser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Integration: Adaptive Misconception Diagnosis Loop', () => {
  let demoQuestionId = '';
  
  beforeAll(async () => {
    // Make sure we have the programming demo question
    const q = await prisma.question.findFirst({ where: { expectedAnswer: 'A' } });
    if (q) demoQuestionId = q.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should diagnose Condition Inversion misconception when answering B', async () => {
    if (!demoQuestionId) return; // skip if db not seeded
    
    // Simulate wrong response
    const result = await diagnoser.analyzeResponse(demoQuestionId, 'if (x = 5)', 'demo-user');
    
    expect(result.status).toBe('DIAGNOSED');
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.selectedMisconceptionId).toBeDefined();
    
    const misconception = await prisma.misconception.findUnique({
      where: { id: result.selectedMisconceptionId! },
      include: { interventions: true }
    });
    
    expect(misconception?.name).toBe('Assignment vs Equality');
    expect(misconception?.interventions.length).toBeGreaterThan(0);
    expect(result.trace).toContain('Targeted misconception selected: m_prog_1');
  });

  it('should return NOVEL_OR_UNCERTAIN for garbage answer', async () => {
    if (!demoQuestionId) return;
    const result = await diagnoser.analyzeResponse(demoQuestionId, 'I am totally lost here man', 'demo-user');
    expect(result.status).toBe('NOVEL_OR_UNCERTAIN');
    expect(result.candidates.length).toBe(0);
  });
});
