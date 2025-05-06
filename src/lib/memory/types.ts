export type SymbolicMemoryNode = {
  id: string;
  label: string;
  archetype: string;
  extractedFrom: string;
  keyPhrases: string[];
  coreObservations: string[];
  activationCue: string[];
  relevanceToAgent: string;
  useCases: string[];

  // Reinforcement metadata
  weight: number; // 0.0 – 1.0
  usageCount: number;
  lastTriggered: string | null;
  reinforcedBy: string[];
  decayRate: number; // per day (e.g. 0.01)
  status: 'active' | 'fading' | 'archived';
}; 