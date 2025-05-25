import type { AgentState } from '../../types/agent';
import type { EvolutionPlan } from './evolutionManager';

export interface SymbolicDiff {
  resolvedIssues: string[];
  affectedModules: string[];
  estimatedConfidenceGain: number;
  eliminatedDecayedSymbols: string[];
}

/**
 * Deep clones the AgentState to avoid mutating the live agent memory.
 */
export function cloneAgentState(original: AgentState): AgentState {
  return JSON.parse(JSON.stringify(original));
}

/**
 * Simulates how applying a given evolution plan might affect symbolic alignment.
 */
export function simulatePlan(plan: EvolutionPlan, state: AgentState): SymbolicDiff {
  const clone = cloneAgentState(state);
  const resolvedIssues: string[] = [];
  const affectedModules = new Set<string>();
  let estimatedConfidenceGain = 0;
  const eliminatedDecayedSymbols: string[] = [];

  // Simulate plan application
  if (plan.targetModule) {
    affectedModules.add(plan.targetModule);
  }

  for (const candidate of clone.pendingImprovements || []) {
    const issue = candidate.issue || 'unspecified';
    if (plan.reason.includes(issue)) {
      resolvedIssues.push(issue);
      estimatedConfidenceGain += 0.05;
    }
  }

  // Example symbolic decay elimination estimate
  if (plan.action === 'REINVESTIGATE') {
    eliminatedDecayedSymbols.push(plan.reason);
    estimatedConfidenceGain += 0.02;
  }

  return {
    resolvedIssues,
    affectedModules: [...affectedModules],
    estimatedConfidenceGain: parseFloat(estimatedConfidenceGain.toFixed(2)),
    eliminatedDecayedSymbols
  };
} 