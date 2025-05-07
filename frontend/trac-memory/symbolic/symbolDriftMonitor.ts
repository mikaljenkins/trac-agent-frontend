// Define the SymbolicMemoryNode type
export interface SymbolicMemoryNode {
  id: string;
  label: string;
  archetype: string;
  extractedFrom: string;
  keyPhrases: string[];
  coreObservations: string[];
  activationCue: string;
  relevanceToAgent: string;
  useCases: string[];
  weight: number;
  usageCount: number;
  lastTriggered: string | null;
  reinforcedBy: string[];
  decayRate: number;
  status: 'active' | 'fading' | 'archived';
}

// Module Purpose: Enable TracAgent to detect symbolic memory drift by analyzing node activity decay, usage, and recency.
// This module sets the foundation for future symbolic decay tuning and visualization.

// Types:
export type DriftReport = {
  nodeId: string;
  label: string;
  driftScore: number;
  lastTriggered: string | null;
  usageCount: number;
  decayRate: number;
};

// Required Functions:
// 1. analyzeSymbolDrift(nodes: SymbolicMemoryNode[]): DriftReport[]
//    For each node, calculate driftScore based on decayRate, lastTriggered (timestamp recency), and usageCount.
//    Return sorted array of DriftReport objects (highest drift first).
export function analyzeSymbolDrift(nodes: SymbolicMemoryNode[]): DriftReport[] {
  const reports: DriftReport[] = nodes.map(node => {
    const driftScore = computeDriftScore(node);
    return {
      nodeId: node.id,
      label: node.label,
      driftScore,
      lastTriggered: node.lastTriggered,
      usageCount: node.usageCount,
      decayRate: node.decayRate,
    };
  });
  return reports.sort((a, b) => b.driftScore - a.driftScore);
}

// 2. getDriftingSymbols(reports: DriftReport[], threshold: number): DriftReport[]
//    Return all reports where driftScore >= threshold.
export function getDriftingSymbols(reports: DriftReport[], threshold: number): DriftReport[] {
  return reports.filter(report => report.driftScore >= threshold);
}

// Helper function to compute drift score based on node properties.
function computeDriftScore(node: SymbolicMemoryNode): number {
  const recencyScore = node.lastTriggered ? 1 / (Date.now() - new Date(node.lastTriggered).getTime()) : 0;
  const usageScore = node.usageCount / 100; // Normalize usage count
  const decayScore = node.decayRate;
  return (recencyScore + usageScore + decayScore) / 3; // Average of the three scores
}

// Future Integration:
// - Hook into mutation cycle (run every N cycles)
// - Display flagged drift nodes in a UI panel or dashboard
// - Allow dev review/edit of decayed or noisy symbols 