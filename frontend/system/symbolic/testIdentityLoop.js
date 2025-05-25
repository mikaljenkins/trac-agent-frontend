import { runIdentityLoop } from './identityLoop.ts';

async function testIdentityLoop() {
  try {
    const entry = await runIdentityLoop();
    console.log('Generated identity entry:', JSON.stringify(entry, null, 2));
    
    // Verify the entry was written to the log file
    const fs = await import('fs/promises');
    const content = await fs.readFile('logs/identity-loop.jsonl', 'utf-8');
    console.log('\nIdentity log contents:', content);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testIdentityLoop(); 