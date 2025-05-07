import type { WeeklyReflectionEntry } from './weeklyReflectionSynthesizer';
import type { ArchetypeName } from './archetypes/archetypeRouter';

export interface SymbolicDiff {
  repeatedSymbols: string[];
  addedSymbols: string[];
  fadedSymbols: string[];
  archetypeShift?: {
    from: ArchetypeName | string;
    to: ArchetypeName | string;
  };
  entropyDelta?: number;
  // TODO: Add impact scoring, fading coefficient, and growth metrics
}

/**
 * Compares two weekly reflections for symbolic drift, repetition, and growth.
 */
export function compareWeeklyReflections(a: WeeklyReflectionEntry, b: WeeklyReflectionEntry): SymbolicDiff {
  const setA = new Set(a.dominantSymbols);
  const setB = new Set(b.dominantSymbols);

  const repeatedSymbols = [...setA].filter(s => setB.has(s));
  const addedSymbols = [...setB].filter(s => !setA.has(s));
  const fadedSymbols = [...setA].filter(s => !setB.has(s));

  let archetypeShift;
  if (a.archetypeForecast !== b.archetypeForecast) {
    archetypeShift = {
      from: a.archetypeForecast,
      to: b.archetypeForecast
    };
  }

  let entropyDelta;
  if (typeof a.symbolicEntropyLevel === 'number' && typeof b.symbolicEntropyLevel === 'number') {
    entropyDelta = b.symbolicEntropyLevel - a.symbolicEntropyLevel;
  }

  // TODO: Add impact scoring, fading coefficient, and growth metrics

  return {
    repeatedSymbols,
    addedSymbols,
    fadedSymbols,
    archetypeShift,
    entropyDelta
  };
} 