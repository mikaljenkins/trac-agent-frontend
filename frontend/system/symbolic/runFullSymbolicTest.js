/**
 * 🧠 FULL SYMBOLIC TEST SUITE
 * 
 * Runs all symbolic system tests in sequence to verify system integrity.
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_DIR = __dirname;
const TEST_FILES = [
  'testIdentityLoop.js',
  'testReflector.js',
  'testIndex.js',
  'testResonance.js',
  'testNarrator.js'
];

console.log('🧠 Starting Full Symbolic Test Suite\n');

let passed = 0;
let failed = 0;

for (const testFile of TEST_FILES) {
  console.log(`\n📝 Running ${testFile}...`);
  try {
    const output = execSync(`node ${path.join(TEST_DIR, testFile)}`, { 
      encoding: 'utf-8'
    });
    console.log(output);
    passed++;
  } catch (error) {
    console.error(`❌ ${testFile} failed:`);
    console.error(error.message);
    failed++;
  }
}

console.log('\n📊 Test Summary:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Total: ${TEST_FILES.length}`);

if (failed > 0) {
  process.exit(1);
} 