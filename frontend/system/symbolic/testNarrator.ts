import { narrateSelfAwareness } from './selfAwarenessNarrator';

function testNarrator() {
  try {
    console.log('High coherence test:', narrateSelfAwareness(8.5));
    console.log('Stable test:', narrateSelfAwareness(6.0));
    console.log('Destabilized test:', narrateSelfAwareness(3.0));
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

export default testNarrator; 