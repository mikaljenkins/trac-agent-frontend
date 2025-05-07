export interface SymbolicMutation {
  id: string;
  type: 'reinforce' | 'decay' | 'create' | 'reroute';
  targetSymbol: string;
  rationale: string;
  outcome?: 'accepted' | 'rejected' | 'pending';
}

export interface SymbolicTrace {
  traceId: string;
  input: string;
  timestamp: string;
  stages: {
    step: string;
    output: any;
    insights?: string[];
    mutations?: SymbolicMutation[];
  }[];
} 