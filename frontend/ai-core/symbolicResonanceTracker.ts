import { SymbolicMemoryNode } from './memorySync';
import { WeeklyReflectionEntry } from './weeklyReflectionSynthesizer';

/**
 * Tracks how often each symbol appears across multiple reflections.
 * Used to determine symbolic resonance: repetition + memory persistence.
 */
export function calculateSymbolicResonance(
  reflections: WeeklyReflectionEntry[],
  currentMemory: SymbolicMemoryNode[]
): Record<string, number> {
  const resonanceMap: Record<string, number> = {};

  // Count symbol frequency in reflections
  for (const reflection of reflections) {
    const symbols = reflection.dominantSymbols || [];
    for (const symbol of symbols) {
      resonanceMap[symbol] = (resonanceMap[symbol] || 0) + 1;
    }
  }

  // Add current memory nodes to resonance
  for (const node of currentMemory) {
    // Weight memory nodes by their reinforcement score
    const weight = node.reinforcementScore || 1;
    resonanceMap[node.label] = (resonanceMap[node.label] || 0) + weight;
  }

  return resonanceMap;
}

/**
 * Returns top resonant symbols sorted by frequency.
 * Optionally filters by minimum resonance threshold.
 */
export function getTopResonantSymbols(
  resonanceMap: Record<string, number>,
  limit = 5,
  minResonance = 1
): { label: string; count: number }[] {
  return Object.entries(resonanceMap)
    .filter(([_, count]) => count >= minResonance)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Groups resonant symbols by their decay rates.
 * Helps identify which resonant concepts are fading vs. persisting.
 */
export function groupResonantSymbolsByDecay(
  resonanceMap: Record<string, number>,
  memory: SymbolicMemoryNode[]
): {
  persisting: { label: string; count: number; decayScore: number }[];
  fading: { label: string; count: number; decayScore: number }[];
} {
  const persisting: { label: string; count: number; decayScore: number }[] = [];
  const fading: { label: string; count: number; decayScore: number }[] = [];

  for (const [label, count] of Object.entries(resonanceMap)) {
    const memoryNode = memory.find(node => node.label === label);
    if (!memoryNode) continue;

    const entry = {
      label,
      count,
      decayScore: memoryNode.decayScore
    };

    if (memoryNode.decayScore < 0.5) {
      persisting.push(entry);
    } else {
      fading.push(entry);
    }
  }

  return {
    persisting: persisting.sort((a, b) => b.count - a.count),
    fading: fading.sort((a, b) => b.count - a.count)
  };
}

/**
 * Calculates resonance stability over time.
 * Higher stability means consistent symbol frequency across reflections.
 */
export function calculateResonanceStability(
  reflections: WeeklyReflectionEntry[]
): number {
  if (reflections.length < 2) return 1;

  const symbolFrequencies: Record<string, number[]> = {};
  
  // Collect frequency of each symbol across reflections
  reflections.forEach(reflection => {
    const symbols = reflection.dominantSymbols || [];
    symbols.forEach(symbol => {
      if (!symbolFrequencies[symbol]) {
        symbolFrequencies[symbol] = new Array(reflections.length).fill(0);
      }
      symbolFrequencies[symbol][reflections.indexOf(reflection)] = 1;
    });
  });

  // Calculate variance in frequency for each symbol
  const variances = Object.values(symbolFrequencies).map(frequencies => {
    const mean = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
    const variance = frequencies.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / frequencies.length;
    return variance;
  });

  // Stability is inverse of average variance
  const averageVariance = variances.reduce((a, b) => a + b, 0) / variances.length;
  return Math.max(0, 1 - averageVariance);
} 