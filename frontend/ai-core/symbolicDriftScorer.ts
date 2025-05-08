import { SymbolicMemoryNode, ReinforcementEvent } from './memorySync';
import fs from 'fs/promises';
import path from 'path';

export interface DriftScoreReport {
  convergence: number;        // 0.0–1.0: How much reinforcement repeats
  divergence: number;         // 0.0–1.0: Novelty in reinforcements
  decayRate: number;          // Avg decayScore of memory nodes
  dominantSymbols: string[];  // Top reinforced symbols
  timestamp: string;          // When the analysis was performed
}

/**
 * Analyzes symbolic memory evolution by scoring reinforcement patterns.
 * Identifies whether memory is converging (stabilizing), diverging (spreading),
 * or decaying (fading) based on recent reinforcement events.
 */
export function analyzeSymbolicDrift(
  currentMemory: SymbolicMemoryNode[],
  recentReinforcements: ReinforcementEvent[]
): DriftScoreReport {
  const now = new Date().toISOString();

  // Convergence: frequency of repeated reinforcements
  const reinforcementMap = new Map<string, number>();
  for (const event of recentReinforcements) {
    reinforcementMap.set(event.symbol, (reinforcementMap.get(event.symbol) || 0) + 1);
  }

  const uniqueSymbols = reinforcementMap.size;
  const totalEvents = recentReinforcements.length;
  
  // Calculate convergence as the ratio of most frequent symbol to total events
  const convergence = totalEvents > 0 
    ? Math.max(...Array.from(reinforcementMap.values())) / totalEvents 
    : 0;

  // Divergence: how many different symbols were reinforced
  // Higher ratio means more novel symbols being reinforced
  const divergence = totalEvents > 0 
    ? uniqueSymbols / totalEvents 
    : 0;

  // Decay rate: average decay of memory nodes
  // Lower score means memory is being reinforced more
  const decayRate = currentMemory.length > 0
    ? currentMemory.reduce((sum, node) => sum + node.decayScore, 0) / currentMemory.length
    : 1.0;

  // Dominant symbols: top 3 most frequently reinforced
  const dominantSymbols = Array.from(reinforcementMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([symbol]) => symbol);

  return {
    convergence: parseFloat(convergence.toFixed(2)),
    divergence: parseFloat(divergence.toFixed(2)),
    decayRate: parseFloat(decayRate.toFixed(2)),
    dominantSymbols,
    timestamp: now
  };
}

/**
 * Loads recent reinforcement events from the journal.
 * Used to analyze drift over a specific time window.
 */
export async function loadRecentReinforcements(
  daysBack: number = 7
): Promise<ReinforcementEvent[]> {
  const events: ReinforcementEvent[] = [];
  const now = new Date();
  const cutoff = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

  // Load events from each day's journal file
  for (let i = 0; i < daysBack; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const filePath = path.join(process.cwd(), 'journal', 'reinforcements', `reinforce-${dateStr}.json`);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const dayEvents: ReinforcementEvent[] = JSON.parse(content);
      
      // Filter events after cutoff
      const recentEvents = dayEvents.filter(event => 
        new Date(event.timestamp) >= cutoff
      );
      
      events.push(...recentEvents);
    } catch (err) {
      // Skip if file doesn't exist
      continue;
    }
  }

  return events;
}

/**
 * Generates a drift analysis report for the current memory state.
 * Combines recent reinforcement events with current memory nodes.
 */
export async function generateDriftReport(
  currentMemory: SymbolicMemoryNode[],
  daysBack: number = 7
): Promise<DriftScoreReport> {
  const recentEvents = await loadRecentReinforcements(daysBack);
  return analyzeSymbolicDrift(currentMemory, recentEvents);
} 