import { SymbolicMemoryNode } from './memorySync';

export interface AgentState {
  currentArchetype: string;
  symbolicMemory: SymbolicMemoryNode[];
  // ... other existing properties
} 