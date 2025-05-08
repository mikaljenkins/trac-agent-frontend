export interface AgentState {
  activeArchetype: string;
  predictedArchetype?: string;
  lastReflection?: string;
  trustDriftScore?: number;
  lastSymbolicHealth?: {
    entropy: number;
  };
  symbolicMemory?: Array<{
    label: string;
  }>;
} 