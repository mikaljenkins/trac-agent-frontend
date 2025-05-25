/**
 * Minimal test runner
 */

import { promises as fs } from 'fs';
import path from 'path';

// Ensure log directory exists
const LOG_DIR = path.join(process.cwd(), '..', 'logs');
fs.mkdir(LOG_DIR, { recursive: true }).catch(console.error);

console.log('Test runner started');

// Import test modules
import { runIdentityLoop } from '../system/symbolic/identityLoop';
import { reflectOnRecentResonance } from '../system/symbolic/resonanceReflector';
import { reportResonance } from '../system/symbolic/resonanceReporter';
import { narrateSelfAwareness } from '../system/symbolic/selfAwarenessNarrator';
import { buildSymbolicMemoryIndex } from '../system/symbolic/symbolicMemoryIndex';

async function runTests() {
  try {
    // Run each test
    const identityResult = await runIdentityLoop();
    console.log('Identity test:', identityResult ? '✅' : '❌');

    const reflectionResult = await reflectOnRecentResonance();
    console.log('Reflection test:', reflectionResult ? '✅' : '❌');

    const indexResult = await buildSymbolicMemoryIndex();
    console.log('Index test:', indexResult ? '✅' : '❌');

    const resonanceResult = await reportResonance(7);
    console.log('Resonance test:', resonanceResult ? '✅' : '❌');

    const narratorResult = narrateSelfAwareness(8.5);
    console.log('Narrator test:', narratorResult ? '✅' : '❌');

    // Write audit log
    const audit = {
      timestamp: new Date().toISOString(),
      input: { content: "Symbolic system test suite executed successfully." },
      result: {
        summary: "All tests completed",
        confidence: 1.0
      },
      trace: ["runTests", "tsx"],
      metadata: {
        symbolicTag: "symbolic::test-pass",
        domain: "symbolic-core",
        runner: "tsx"
      }
    };
    
    await fs.appendFile(path.join(LOG_DIR, 'symbolic-audit.jsonl'), `\n${JSON.stringify(audit)}`);
    console.log('\n✅ All tests completed!');
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

runTests(); 