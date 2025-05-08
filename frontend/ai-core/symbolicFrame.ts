import { AgentState } from '@/system/agentState';

export interface SymbolicLLMPrompt {
  systemMessage: string;
  userContext?: string;
  symbolicState: {
    activeArchetype: string;
    predictedArchetype?: string;
    trustDriftScore?: number;
    entropy?: number;
    memoryEcho?: string[];
  };
  entropyNote?: string;
}

export function formatSymbolicPrompt(state: AgentState): SymbolicLLMPrompt {
  return {
    systemMessage: `You are acting as the ${state.activeArchetype} archetype.`,
    userContext: state.lastReflection ?? 'No recent reflection found.',
    symbolicState: {
      activeArchetype: state.activeArchetype,
      predictedArchetype: state.predictedArchetype,
      trustDriftScore: state.trustDriftScore,
      entropy: state.lastSymbolicHealth?.entropy,
      memoryEcho: state.symbolicMemory?.slice(-5).map((node: any) => node.label) ?? [],
    },
    entropyNote: state.lastSymbolicHealth?.entropy
      ? `Entropy level: ${state.lastSymbolicHealth.entropy.toFixed(2)}`
      : undefined,
  };
} 