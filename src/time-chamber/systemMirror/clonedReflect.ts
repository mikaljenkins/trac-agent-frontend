// Cloned version of reflection system for simulation
// Allows testing different reflection strategies

import { ClonedAgentState } from './clonedAgentState';
import { LoopEvent } from '@/system/loopMonitor';

export interface SimulationInsight {
  simulationId: string;
  timestamp: string;
  dominantSymbol: string;
  trustTrend: 'stable' | 'improving' | 'declining';
  mutationImpact: number;
}

export const generateSimulationInsight = (
  state: ClonedAgentState,
  events: LoopEvent[]
): SimulationInsight => {
  const trustTrend = analyzeTrustTrend(events);
  const mutationImpact = calculateMutationImpact(state);

  return {
    simulationId: state.simulationId,
    timestamp: new Date().toISOString(),
    dominantSymbol: state.lastDreamSymbol || 'none',
    trustTrend,
    mutationImpact
  };
};

function analyzeTrustTrend(events: LoopEvent[]): 'stable' | 'improving' | 'declining' {
  const trustEvents = events.filter(e => 
    e.source === 'summonRules' && 
    e.action === 'summoningTracFriend'
  );

  if (trustEvents.length < 2) return 'stable';

  const trustScores = trustEvents.map(e => e.payload.trustLevel);
  const trend = trustScores.reduce((acc, score, i) => {
    if (i === 0) return 0;
    return acc + (score - trustScores[i - 1]);
  }, 0);

  if (Math.abs(trend) < 0.1) return 'stable';
  return trend > 0 ? 'improving' : 'declining';
}

function calculateMutationImpact(state: ClonedAgentState): number {
  return state.mutationHistory.length > 0 ? 0.5 : 0;
} 