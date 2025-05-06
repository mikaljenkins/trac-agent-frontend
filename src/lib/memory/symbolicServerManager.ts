import * as fs from 'fs';
import path from 'path';
import { SymbolicMemoryNode } from './types';
import { logMemoryTrigger } from './memoryLog';

const MEMORY_DIR = path.resolve(process.cwd(), 'trac-memory/symbolic');

export async function loadSymbolicMemories(): Promise<SymbolicMemoryNode[]> {
  const files = fs.readdirSync(MEMORY_DIR);
  const nodes: SymbolicMemoryNode[] = [];

  for (const file of files) {
    if (file.startsWith('._')) continue; // Skip macOS resource fork files
    const modulePath = path.join(MEMORY_DIR, file);
    const mod = await import(modulePath);
    const node = Object.values(mod)[0] as SymbolicMemoryNode;
    nodes.push(node);
  }

  return nodes;
}

export function findRelevantMemories(input: string, nodes: SymbolicMemoryNode[]): SymbolicMemoryNode[] {
  const lowerInput = input.toLowerCase();
  const triggered = nodes.filter((node) =>
    node.activationCue.some(cue => lowerInput.includes(cue.toLowerCase()))
  );

  // Log each triggered memory
  triggered.forEach(node => {
    logMemoryTrigger({
      id: node.id,
      title: node.label,
      triggeredAt: Date.now(),
      input,
      node,
      context: {
        weight: node.weight,
        status: node.status,
        usageCount: node.usageCount
      }
    });
  });

  return triggered;
}

export function reinforceMemory(node: SymbolicMemoryNode, input: string): void {
  node.usageCount += 1;
  node.lastTriggered = new Date().toISOString();
  node.weight = Math.min(1.0, node.weight + 0.05);
  node.reinforcedBy.push(input);
}

export function decayMemories(nodes: SymbolicMemoryNode[]): SymbolicMemoryNode[] {
  const now = Date.now();

  return nodes.map(node => {
    if (!node.lastTriggered) return node;

    const last = new Date(node.lastTriggered).getTime();
    const daysInactive = (now - last) / (1000 * 60 * 60 * 24);
    const decayAmount = daysInactive * node.decayRate;

    node.weight = Math.max(0, node.weight - decayAmount);

    if (node.weight < 0.3) node.status = 'fading';
    if (node.weight <= 0) node.status = 'archived';

    return node;
  });
} 