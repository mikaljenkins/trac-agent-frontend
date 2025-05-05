// Cloned version of TracAgent's state for simulation
// Allows mutations without affecting the main agent

import { AgentState } from '@/system/agentState';

export interface ClonedAgentState extends AgentState {
  mutationHistory: string[];
  simulationId: string;
}

export const createClonedState = (baseState: AgentState, simulationId: string): ClonedAgentState => ({
  ...baseState,
  mutationHistory: [],
  simulationId
});

export const applyMutation = (
  state: ClonedAgentState,
  mutation: { field: keyof AgentState; value: any }
): ClonedAgentState => ({
  ...state,
  [mutation.field]: mutation.value,
  mutationHistory: [...state.mutationHistory, JSON.stringify(mutation)]
}); 