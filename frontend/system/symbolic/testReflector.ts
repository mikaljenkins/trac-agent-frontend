import { reflectOnRecentResonance } from './resonanceReflector';

async function testReflector() {
  try {
    const reflection = await reflectOnRecentResonance();
    console.log('Generated reflection:', JSON.stringify(reflection, null, 2));
    
    // Verify the reflection was written to the log file
    const fs = await import('fs/promises');
    const content = await fs.readFile('logs/reflection-thread.jsonl', 'utf-8');
    console.log('\nReflection log contents:', content);
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

export default testReflector; 