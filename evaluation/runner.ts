import { LLMAnalyzer, DeterministicAnalyzer } from '../src/lib/engine/SemanticAnalyzer';
import * as fs from 'fs';
import * as path from 'path';

// Load mock candidates to evaluate independently of Prisma to avoid setting up a mock DB for the runner.
const mockCandidates = [
  { id: 'm_prog_1', triggers: ['x is set to 5', 'x becomes 5', 'x =', 'not equal to 10'] },
  { id: 'm_prog_4', triggers: ['selected else when true', 'B', '<'] },
  { id: 'm_alg_1', triggers: ['-2x + 8'] },
  { id: 'm_phy_1', triggers: ['60'] }
];

async function runEvaluation() {
  const datasetPath = path.join(__dirname, 'dataset.json');
  const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
  
  const analyzer = new DeterministicAnalyzer();
  
  let correctStatus = 0;
  let correctMisconception = 0;
  let total = dataset.length;
  let tp = 0, fp = 0, fn = 0;

  const results = [];

  for (const example of dataset) {
    const analysis = await analyzer.analyze(example.questionContent, example.expectedAnswer, example.learnerResponse, mockCandidates);
    
    let status = 'DIAGNOSED';
    if (analysis.matchedMisconceptionIds.length === 0) status = 'NOVEL_OR_UNCERTAIN';
    if (analysis.matchedMisconceptionIds.length > 1) status = 'AMBIGUOUS';
    
    const predictedMisconception = analysis.matchedMisconceptionIds[0] || null;

    const isStatusCorrect = status === example.expectedStatus;
    const isMisconceptionCorrect = predictedMisconception === example.groundTruthMisconception;
    
    if (isStatusCorrect) correctStatus++;
    if (isMisconceptionCorrect) correctMisconception++;

    if (predictedMisconception === example.groundTruthMisconception && predictedMisconception !== null) {
      tp++;
    } else if (predictedMisconception !== null && example.groundTruthMisconception === null) {
      fp++;
    } else if (predictedMisconception === null && example.groundTruthMisconception !== null) {
      fn++;
    } else if (predictedMisconception !== null && example.groundTruthMisconception !== null && predictedMisconception !== example.groundTruthMisconception) {
      fp++;
      fn++;
    }

    results.push({
      id: example.id,
      predictedStatus: status,
      expectedStatus: example.expectedStatus,
      predictedMisconception,
      expectedMisconception: example.groundTruthMisconception,
      success: isMisconceptionCorrect
    });
  }

  const precision = tp / (tp + fp) || 0;
  const recall = tp / (tp + fn) || 0;
  const f1 = 2 * (precision * recall) / (precision + recall) || 0;
  const accuracy = correctMisconception / total;

  const reportData = {
    totalExamples: total,
    accuracy,
    precision,
    recall,
    f1,
    correctStatusCount: correctStatus,
    correctMisconceptionCount: correctMisconception,
    results
  };

  fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify(reportData, null, 2));

  const mdReport = `# Evaluation Report
## Metrics
- **Total Examples**: ${total}
- **Accuracy**: ${(accuracy * 100).toFixed(2)}%
- **Precision**: ${(precision * 100).toFixed(2)}%
- **Recall**: ${(recall * 100).toFixed(2)}%
- **F1 Score**: ${(f1 * 100).toFixed(2)}%

## Details
${results.map(r => `- [${r.success ? 'PASS' : 'FAIL'}] ${r.id}: Expected ${r.expectedMisconception || 'None'}, got ${r.predictedMisconception || 'None'}`).join('\\n')}
`;

  fs.writeFileSync(path.join(__dirname, 'report.md'), mdReport);
  console.log('Evaluation complete. Check evaluation/report.md');
}

runEvaluation().catch(console.error);
