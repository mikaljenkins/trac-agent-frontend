import { reportResonance } from './resonanceReporter.ts';

async function testResonance() {
  try {
    const report = await reportResonance(7);
    console.log('Generated report:', report);
    
    // Verify the report was written to the log file
    const fs = await import('fs/promises');
    const content = await fs.readFile('logs/resonance-reports.jsonl', 'utf-8');
    console.log('\nLog file contents:', content);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testResonance(); 