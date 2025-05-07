import type { SymbolicMemoryNode } from '../trac-memory/symbolic/symbolDriftMonitor';
import type { SymbolicDiff } from './symbolicDiffer';

// Extend SymbolicMemoryNode locally to include decayScore for pruning
export interface PrunableSymbolicMemoryNode {
  label: string;
  decayScore?: number;
  // ...other fields from SymbolicMemoryNode as needed
}

/**
 * Prunes symbolic memory nodes based on drift analysis.
 * Reduces priority/weight/decayScore for faded symbols, leaves others untouched.
 * TODO: Add hard deletion, soft pruning, and relevance rebalancing logic.
 */
export function pruneSymbolicMemory(
  currentMemory: PrunableSymbolicMemoryNode[],
  diff: SymbolicDiff
): PrunableSymbolicMemoryNode[] {
  const fadedSet = new Set(diff.fadedSymbols || []);
  return currentMemory.map(node => {
    if (fadedSet.has(node.label)) {
      // Reduce decayScore or relevance for faded nodes
      return {
        ...node,
        decayScore: typeof node.decayScore === 'number' ? Math.min(1, (node.decayScore || 0) + 0.2) : 0.2,
        // TODO: Add fadeCounter or increment if present
        // TODO: Adjust relevanceToAgent or weight if present
      };
    }
    // Leave repeated/added nodes untouched for now
    return node;
  });
}

// TODO: Implement hard deletion threshold for nodes with high decayScore or fadeCounter
// TODO: Add soft pruning visualization hooks
// TODO: Rebalance relevance scores based on drift and usage 