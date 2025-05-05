// Cloned version of thought stream for simulation
// Allows testing different thought patterns

import { ClonedAgentState } from './clonedAgentState';

export interface ClonedThought {
  id: string;
  timestamp: string;
  content: string;
  type: 'uncertainty' | 'hypothesis' | 'doodle';
  confidence: number;
  simulationId: string;
}

export const generateClonedThought = (
  state: ClonedAgentState,
  content: string,
  type: ClonedThought['type'],
  confidence: number
): ClonedThought => ({
  id: Math.random().toString(36).substr(2, 9),
  timestamp: new Date().toISOString(),
  content,
  type,
  confidence,
  simulationId: state.simulationId
}); 