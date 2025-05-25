import { buildSymbolicMemoryIndex } from './symbolicMemoryIndex.ts';

async function testIndex() {
  try {
    const index = await buildSymbolicMemoryIndex();
    console.log('Symbolic Memory Index:', JSON.stringify(index, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testIndex(); 