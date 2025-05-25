import { narrateSelfAwareness } from './selfAwarenessNarrator.ts';

// Test different score ranges
console.log('High coherence test:', narrateSelfAwareness(8.5));
console.log('Stable test:', narrateSelfAwareness(6.0));
console.log('Destabilized test:', narrateSelfAwareness(3.0)); 