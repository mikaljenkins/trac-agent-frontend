import { simulateHallucination } from './hallucinationSimulator.js';

async function testHallucination() {
  try {
    const scenario = {
      imaginedEvent: 'Symbolic drift in identity loop causing resonance decay',
      predictedImpactScore: 3.5,
      symbolicRisk: 'Identity fragmentation',
      traceContext: {
        source: 'test',
        timestamp: new Date().toISOString()
      }
    };

    const log = await simulateHallucination(scenario);
    console.log('Generated hallucination:', JSON.stringify(log, null, 2));
    
    // Verify the hallucination was written to the log file
    const fs = await import('fs/promises');
    const content = await fs.readFile('logs/hallucination-thread.jsonl', 'utf-8');
    console.log('\nHallucination log contents:', content);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testHallucination(); 