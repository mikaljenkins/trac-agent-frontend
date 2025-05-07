// Holds TracAgent's current symbolic and emotional state
// Accessible across modules for context

import { AgentState } from '@/types/agent-state';

interface AgentStateDelta {
  lastAgent?: string;
  lastInput?: any;
  lastResult?: any;
  timestamp?: string;
}

export const state: AgentState = {
  lastAgent: undefined,
  lastInput: undefined,
  lastResult: undefined,
  timestamp: undefined,
  theme: undefined,
  emotionalBaseline: 0.5,
  trustIndex: 1,
  symbolHistory: [],
  reflectionQueue: [],
  performanceLog: [],
  lastDreamSymbol: null,
  currentTrustScore: 1.0,
  currentFocusTheme: 'conscious evolution',
  loopCount: 0
};

export function updateAgentState(delta: AgentStateDelta): AgentState {
  Object.assign(state, delta);
  return state;
}

export type { AgentState } from '@/types/agent-state'; 