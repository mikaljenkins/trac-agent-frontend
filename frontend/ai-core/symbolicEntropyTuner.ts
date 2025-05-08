import { SymbolicMemoryNode } from './memorySync';
import { DriftScoreReport } from './symbolicDriftScorer';

/**
 * Adjusts decay rates of symbolic memory nodes based on their drift behavior.
 * Reinforced symbols decay slower, while neglected ones fade faster.
 */
export function tuneEntropyDecay(
  memory: SymbolicMemoryNode[],
  drift: DriftScoreReport
): SymbolicMemoryNode[] {
  const reinforced = new Set(drift.dominantSymbols);

  return memory.map((node) => {
    if (reinforced.has(node.label)) {
      // Strengthen persistence for dominant symbols
      return {
        ...node,
        decayScore: Math.max(0.1, node.decayScore * 0.8), // Slower decay
        reinforcementScore: (node.reinforcementScore || 0) + 0.2 // Boost reinforcement
      };
    }

    // For non-dominant symbols, adjust based on overall drift
    const decayMultiplier = drift.convergence > 0.7 
      ? 1.2  // Accelerate decay if memory is highly convergent
      : drift.divergence > 0.7
        ? 0.9 // Slow decay if memory is highly divergent
        : 1.0; // No change if balanced

    return {
      ...node,
      decayScore: Math.min(1.0, node.decayScore * decayMultiplier)
    };
  });
}

/**
 * Prunes memory nodes that have decayed beyond a threshold.
 * Removes nodes with high decay scores and low reinforcement.
 */
export function pruneDecayedMemory(
  memory: SymbolicMemoryNode[],
  decayThreshold: number = 0.8,
  minReinforcement: number = 0.1
): SymbolicMemoryNode[] {
  return memory.filter(node => 
    node.decayScore < decayThreshold || 
    (node.reinforcementScore || 0) > minReinforcement
  );
}

/**
 * Adjusts decay rates and prunes memory based on drift analysis.
 * Returns both the tuned memory and a report of changes.
 */
export function adjustDecayRatesFromDrift(
  memory: SymbolicMemoryNode[],
  drift: DriftScoreReport
): {
  tunedMemory: SymbolicMemoryNode[];
  prunedCount: number;
  reinforcedCount: number;
} {
  // First tune decay rates
  const tunedMemory = tuneEntropyDecay(memory, drift);
  
  // Then prune highly decayed nodes
  const prunedMemory = pruneDecayedMemory(tunedMemory);
  
  // Count changes
  const prunedCount = memory.length - prunedMemory.length;
  const reinforcedCount = drift.dominantSymbols.length;

  return {
    tunedMemory: prunedMemory,
    prunedCount,
    reinforcedCount
  };
} 