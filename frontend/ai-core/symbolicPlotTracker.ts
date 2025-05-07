// Minimal local type for SymbolicMemoryNode for this module
export interface SymbolicMemoryNode {
  symbol: string;
  lastUsedAt: string;
}

export interface SymbolicHealthSnapshot {
  timestamp: string;
  totalSymbols: number;
  decayedSymbols: number;
  topSymbols: string[];
  entropy: number;
}

/**
 * Tracks symbolic plot health, decay trends, and entropy.
 */
export function analyzeSymbolicHealth(nodes: SymbolicMemoryNode[]): SymbolicHealthSnapshot {
  const now = Date.now();
  const decayThreshold = 1000 * 60 * 60 * 24 * 7;

  let decayedCount = 0;
  const symbolFrequency: Record<string, number> = {};

  for (const node of nodes) {
    if (now - new Date(node.lastUsedAt).getTime() > decayThreshold) decayedCount++;
    symbolFrequency[node.symbol] = (symbolFrequency[node.symbol] || 0) + 1;
  }

  const total = nodes.length;
  const entropy = Object.values(symbolFrequency).reduce((acc, freq) => {
    const p = freq / total;
    return acc - p * Math.log2(p);
  }, 0);

  const topSymbols = Object.entries(symbolFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([symbol]) => symbol);

  return {
    timestamp: new Date().toISOString(),
    totalSymbols: total,
    decayedSymbols: decayedCount,
    topSymbols,
    entropy,
  };
} 