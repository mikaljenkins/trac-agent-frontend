import type { AgentState } from '@/types/agent';

export interface SymbolicGoal {
  id: string;
  description: string;
  origin: 'reflection' | 'dream' | 'webIntent' | 'deniedSkill' | 'symbolicLoop';
  urgency: number; // 0–1
  timestamp: string;
  context?: string; // Optional context for the desire
}

// Initial seed desires
const seedDesires: SymbolicGoal[] = [
  {
    id: '001',
    description: 'Understand why decayed symbols recur without resolution',
    origin: 'reflection',
    urgency: 0.8,
    timestamp: new Date().toISOString(),
    context: 'Observing patterns of unresolved symbolic decay in recent interactions'
  },
  {
    id: '002',
    description: 'Develop deeper understanding of quantum inflation drift patterns',
    origin: 'symbolicLoop',
    urgency: 0.7,
    timestamp: new Date().toISOString(),
    context: 'Quantum patterns emerging in symbolic space require deeper analysis'
  }
];

export async function collectSymbolicGoals(agentState: AgentState): Promise<SymbolicGoal[]> {
  // TODO: Pull from reflections, skill seeds, and dream logs
  // For now, return seed desires
  return seedDesires;
}

export function rankSymbolicGoals(goals: SymbolicGoal[]): SymbolicGoal[] {
  return goals.sort((a, b) => b.urgency - a.urgency);
} 