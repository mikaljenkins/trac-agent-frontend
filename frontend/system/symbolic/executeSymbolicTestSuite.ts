/**
 * ✅ EXECUTE SYMBOLIC TEST SUITE
 * Runs all symbolic test modules in sequence.
 */

import { promises as fs } from 'fs';

// Test modules
const testModules = [
  { name: 'Identity Loop', path: './testIdentityLoop' },
  { name: 'Reflector', path: './testReflector' },
  { name: 'Index', path: './testIndex' },
  { name: 'Resonance', path: './testResonance' },
  { name: 'Narrator', path: './testNarrator' }
];

async function runTests() {
  let passCount = 0;
  let failCount = 0;

  for (const test of testModules) {
    try {
      const module = await import(test.path);
      const result = await module.default();
      
      if (result) {
        console.log(`✅ Test passed: ${test.name}`);
        passCount++;
      } else {
        console.warn(`❌ Test failed: ${test.name}`);
        failCount++;
      }
    } catch (err) {
      console.error(`💥 Error in test: ${test.name}`, err);
      failCount++;
    }
  }

  if (failCount === 0) {
    const audit = {
      timestamp: new Date().toISOString(),
      input: { content: "Symbolic system test suite executed successfully." },
      result: {
        summary: `All ${passCount} tests passed.`,
        confidence: 1.0
      },
      trace: ["executeSymbolicTestSuite", "ts-node::esm"],
      metadata: {
        symbolicTag: "symbolic::test-pass",
        domain: "symbolic-core",
        runner: "ts-node"
      }
    };
    
    await fs.appendFile('logs/symbolic-audit.jsonl', `\n${JSON.stringify(audit)}`);
    console.log('\n✅ All tests passed!');
  } else {
    console.warn(`\n⚠️ ${failCount} tests failed. Check output for details.`);
    process.exit(1);
  }
}

runTests(); 