import { buildSymbolicMemoryIndex } from './symbolicMemoryIndex';

async function testIndex() {
  try {
    const index = await buildSymbolicMemoryIndex();
    console.log('Symbolic Memory Index:', JSON.stringify(index, null, 2));
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

export default testIndex; 