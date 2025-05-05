// Generates and validates mutations for simulation
// Ensures mutations are meaningful and trackable

import { AgentState } from '@/system/agentState';
import { ClonedAgentState } from './systemMirror/clonedAgentState';

export interface Mutation {
  id: string;
  timestamp: string;
  field: keyof AgentState;
  value: any;
  reason: string;
  impact: number;
}

const mutationStrategies = {
  trust: (state: ClonedAgentState): Mutation => ({
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    field: 'currentTrustScore',
    value: Math.max(0, Math.min(1, state.currentTrustScore + (Math.random() - 0.5) * 0.2)),
    reason: 'Trust level adjustment based on recent interactions',
    impact: 0.3
  }),
  focus: (state: ClonedAgentState): Mutation => ({
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    field: 'currentFocusTheme',
    value: state.lastDreamSymbol || state.currentFocusTheme,
    reason: 'Focus shift based on dominant dream symbol',
    impact: 0.5
  }),
  loop: (state: ClonedAgentState): Mutation => ({
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    field: 'loopCount',
    value: state.loopCount + 1,
    reason: 'Loop count increment for pattern recognition',
    impact: 0.2
  })
};

export const proposeMutation = (state: ClonedAgentState): Mutation => {
  const strategies = Object.values(mutationStrategies);
  const strategy = strategies[Math.floor(Math.random() * strategies.length)];
  return strategy(state);
}; 