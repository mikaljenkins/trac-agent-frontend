import { compareWeeklyReflections } from '../../frontend/ai-core/symbolicDiffer';

const reflectionA = {
  weekEnding: '2025-05-01',
  dominantSymbols: ['mirror', 'loop', 'fire'],
  archetypeForecast: 'Mirror',
  symbolicEntropyLevel: 0.4,
  narrative: 'Week A summary.'
};

const reflectionB = {
  weekEnding: '2025-05-08',
  dominantSymbols: ['mirror', 'drift', 'spark'],
  archetypeForecast: 'Flame',
  symbolicEntropyLevel: 0.55,
  narrative: 'Week B summary.'
};

console.log('=== Symbolic Differ Test ===');
console.log('Reflection A:', reflectionA);
console.log('Reflection B:', reflectionB);

const diff = compareWeeklyReflections({
  weekEnding: reflectionA.weekEnding,
  dominantSymbols: reflectionA.dominantSymbols,
  archetypeForecast: reflectionA.archetypeForecast,
  symbolicEntropyLevel: reflectionA.symbolicEntropyLevel,
  narrative: reflectionA.narrative,
  summary: reflectionA.narrative
}, {
  weekEnding: reflectionB.weekEnding,
  dominantSymbols: reflectionB.dominantSymbols,
  archetypeForecast: reflectionB.archetypeForecast,
  symbolicEntropyLevel: reflectionB.symbolicEntropyLevel,
  narrative: reflectionB.narrative,
  summary: reflectionB.narrative
});

console.log('--- Diff Results ---');
console.log('Repeated symbols:', diff.repeatedSymbols);
console.log('Added symbols:', diff.addedSymbols);
console.log('Faded symbols:', diff.fadedSymbols);
console.log('Archetype shift:', diff.archetypeShift);
console.log('Entropy delta:', diff.entropyDelta); 