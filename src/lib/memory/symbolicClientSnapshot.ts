import { SymbolicMemoryNode } from './types';
import snapshot from '../../../public/static/symbolic-snapshot.json';

// Type assertion to ensure the snapshot matches our expected structure
const typedSnapshot = snapshot as SymbolicMemoryNode[];

export function getSymbolicSnapshot(): SymbolicMemoryNode[] {
  return typedSnapshot;
}

export function findRelevantMemories(input: string): SymbolicMemoryNode[] {
  const nodes = getSymbolicSnapshot();
  const lowerInput = input.toLowerCase();

  return nodes.filter((node) =>
    node.activationCue.some(cue => lowerInput.includes(cue.toLowerCase()))
  );
}

// Note: Client-side functions don't modify the snapshot
// They only read and filter the pre-generated data
export function getActiveMemories(): SymbolicMemoryNode[] {
  return getSymbolicSnapshot().filter(node => node.status === 'active');
}

export function getFadingMemories(): SymbolicMemoryNode[] {
  return getSymbolicSnapshot().filter(node => node.status === 'fading');
}

export function getArchivedMemories(): SymbolicMemoryNode[] {
  return getSymbolicSnapshot().filter(node => node.status === 'archived');
} 