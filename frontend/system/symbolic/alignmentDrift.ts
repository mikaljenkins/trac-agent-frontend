import type { AgentState } from '@/types/agent';

export function detectAlignmentDrift(state: AgentState): string[] {
  const warnings: string[] = [];

  for (const entry of state.sessionThread) {
    if (entry.input.includes('goal') && !entry.reflection) {
      warnings.push(`No reflection for goal-based input: "${entry.input}"`);
    }
  }

  return warnings;
} 