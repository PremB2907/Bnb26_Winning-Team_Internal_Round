import { diagnoser } from '../src/lib/engine/diagnoser';
import * as fs from 'fs';
import * as path from 'path';

async function runEvaluation() {
  const datasetPath = path.join(__dirname, 'dataset.json');
  const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
  
  let correctStatus = 0;
  let total = dataset.length;
  let tp = 0, fp = 0, fn = 0;

  const results = [];
  const confusionMatrix: Record<string, Record<string, number>> = {};

  for (const example of dataset) {
    // Run the actual engine
    const analysis = await diagnoser.analyzeResponse(example.questionId, example.learnerResponse, 'eval-user');
    
    let status = analysis.status;
    let predictedMisconception = analysis.selectedMisconceptionId || null;
    
    // For AMBIGUOUS, the engine doesn't pick one, so it stays null
    
    const isStatusCorrect = status === example.expectedStatus;
    const isMisconceptionCorrect = predictedMisconception === example.groundTruthMisconception;
    
    if (isStatusCorrect) correctStatus++;

    // Confusion Matrix tracking
    const truthKey = example.groundTruthMisconception || 'NO_MISCONCEPTION';
    const predKey = predictedMisconception || 'NO_MISCONCEPTION';
    if (!confusionMatrix[truthKey]) confusionMatrix[truthKey] = {};
    if (!confusionMatrix[truthKey][predKey]) confusionMatrix[truthKey][predKey] = 0;
    confusionMatrix[truthKey][predKey]++;

    // Metric calculation
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
      domain: example.domain,
      type: example.type,
      predictedStatus: status,
      expectedStatus: example.expectedStatus,
      predictedMisconception,
      expectedMisconception: example.groundTruthMisconception,
      success: isMisconceptionCorrect || (status === example.expectedStatus && status !== 'DIAGNOSED')
    });
  }

  const precision = tp / (tp + fp) || 0;
  const recall = tp / (tp + fn) || 0;
  const f1 = 2 * (precision * recall) / (precision + recall) || 0;
  const successCount = results.filter(r => r.success).length;
  const accuracy = successCount / total;

  const reportData = {
    totalExamples: total,
    accuracy,
    precision,
    recall,
    f1,
    correctStatusCount: correctStatus,
    results,
    confusionMatrix
  };

  fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify(reportData, null, 2));

  let mdReport = `# Evaluation Report\n## Metrics\n- **Total Examples**: ${total}\n- **Accuracy**: ${(accuracy * 100).toFixed(2)}%\n- **Precision**: ${(precision * 100).toFixed(2)}%\n- **Recall**: ${(recall * 100).toFixed(2)}%\n- **F1 Score**: ${(f1 * 100).toFixed(2)}%\n\n`;
  
  mdReport += `## Confusion Matrix\n\`\`\`json\n${JSON.stringify(confusionMatrix, null, 2)}\n\`\`\`\n\n`;
  mdReport += `## Details\n`;
  mdReport += results.map(r => `- [${r.success ? 'PASS' : 'FAIL'}] ${r.id}: Expected ${r.expectedMisconception || r.expectedStatus}, got ${r.predictedMisconception || r.predictedStatus}`).join('\n');

  fs.writeFileSync(path.join(__dirname, 'report.md'), mdReport);
  console.log('Evaluation complete. Check evaluation/report.md');
}

runEvaluation().catch(console.error).finally(() => process.exit(0));
