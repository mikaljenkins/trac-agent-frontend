import { AgentState } from '@/system/agentState';
import { SymbolicMutation } from '@/types/trace';

/**
 * Predicts the next likely archetype based on symbolic state and mutation history.
 */
export function predictNextArchetype(state: AgentState, recentMutations: SymbolicMutation[]): string | null {
  let flameWeight = 0;
  let mirrorWeight = 0;
  let oracleWeight = 0;

  for (const mutation of recentMutations) {
    const rationale = mutation.rationale?.toLowerCase() || '';

    if (rationale.includes('intensity') || rationale.includes('loop')) flameWeight += 1;
    if (rationale.includes('self') || rationale.includes('recursive')) mirrorWeight += 1;
    if (rationale.includes('detached') || rationale.includes('oversight')) oracleWeight += 1;
  }

  // Convert reasoningAlertLevel to a number for comparison
  let reasoningAlertNum = 0;
  if (state.reasoningAlertLevel === 'high') reasoningAlertNum = 1.0;
  else if (state.reasoningAlertLevel === 'medium') reasoningAlertNum = 0.5;
  else if (state.reasoningAlertLevel === 'low') reasoningAlertNum = 0;
  else if (typeof state.reasoningAlertLevel === 'number') reasoningAlertNum = state.reasoningAlertLevel;

  if (reasoningAlertNum > 0.7) flameWeight += 2;
  if ((state.emotionalBaseline || 0.5) < 0.3) mirrorWeight += 2;

  const scores = [
    { name: 'Flame', weight: flameWeight },
    { name: 'Mirror', weight: mirrorWeight },
    { name: 'Oracle', weight: oracleWeight },
  ];

  scores.sort((a, b) => b.weight - a.weight);
  return scores[0].weight > 0 ? scores[0].name : null;
} 