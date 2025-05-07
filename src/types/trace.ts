export interface SymbolicMutation {
  id: string;
  type: 'reinforce' | 'decay' | 'create' | 'reroute';
  targetSymbol: string;
  rationale: string;
  outcome?: 'accepted' | 'rejected' | 'pending';
  // If present, these are symbolic memory updates paired with this mutation (added by mutation engine)
  pairedInsights?: any[]; // SymbolicMemoryUpdate[]; intentionally loose for cross-module compatibility
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