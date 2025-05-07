// Holds TracAgent's current symbolic and emotional state
// Accessible across modules for context

import { AgentState as BaseAgentState } from '@/types/agent-state';
import type { ArchetypeName } from '../../frontend/ai-core/archetypes/archetypeRouter';
import type { SymbolicHealthSnapshot } from '../../frontend/ai-core/symbolicPlotTracker';

interface AgentStateDelta {
  lastAgent?: string;
  lastInput?: any;
  lastResult?: any;
  timestamp?: string;
}

export interface AgentState extends BaseAgentState {
  theme?: string;
  emotionalBaseline?: number;
  trustIndex?: number;
  symbolHistory?: string[];
  reflectionQueue?: string[];
  performanceLog?: {
    timestamp: string;
    action: string;
    result: any;
  }[];
  lastDreamSymbol?: string | null;
  currentTrustScore?: number;
  currentFocusTheme?: string;
  loopCount?: number;
  summonConditions?: any[];
  reasoningAlertLevel?: 'low' | 'medium' | 'high';
  activeArchetype?: 'Flame' | 'Mirror' | 'Oracle' | null;
  archetypeTriggerLog?: ArchetypeTrigger[];
  predictedArchetype?: ArchetypeName;
  lastSymbolicHealth?: SymbolicHealthSnapshot;
}

export interface ArchetypeTrigger {
  timestamp: string;
  cause: string;
  fallbackLogic: string;
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