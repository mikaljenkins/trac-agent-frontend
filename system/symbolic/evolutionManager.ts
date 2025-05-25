import type { AgentInput, AgentResult, AgentState, ImprovementCandidate } from '../../types/agent';
import { detectSymbolDrift } from './symbolDriftTracker';

export interface EvolutionPlan {
  action: 'NONE' | 'REINVESTIGATE' | 'OPTIMIZE' | 'REFACTOR';
  reason: string;
  targetModule?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  tested?: boolean;
}

export async function evaluateForEvolution(
  state: AgentState,
  input: AgentInput,
  result: AgentResult
): Promise<EvolutionPlan> {
  const improvements: ImprovementCandidate[] = [];
  const plans: EvolutionPlan[] = [];

  // ... existing code ...

  // Check for decayed issues that need reinvestigation
  const drift = await detectSymbolDrift();
  for (const decayed of drift.decayedSymbols) {
    if (!improvements.find(i => i.issue === decayed)) {
      const plan: EvolutionPlan = {
        action: 'REINVESTIGATE',
        reason: `Issue "${decayed}" decayed without resolution.`,
        targetModule: 'symbolic-memory'
      };
      console.log('⚠️ Incomplete evolution flagged:', plan);
      plans.push(plan);
    }
  }

  // Return highest priority plan or NONE if no plans
  return plans.length > 0 ? plans[0] : { action: 'NONE', reason: 'No evolution needed' };
} 