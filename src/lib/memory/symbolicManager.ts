import * as fs from 'fs';
import path from 'path';
import { SymbolicMemoryNode } from './types';

const MEMORY_DIR = path.resolve(process.cwd(), 'trac-memory/symbolic');

export function loadSymbolicMemory(): SymbolicMemoryNode[] {
  const files = fs.readdirSync(MEMORY_DIR);
  const nodes: SymbolicMemoryNode[] = [];

  for (const file of files) {
    const modulePath = path.join(MEMORY_DIR, file);
    const mod = require(modulePath);
    const node = Object.values(mod)[0] as SymbolicMemoryNode;
    nodes.push(node);
  }

  return nodes;
}

export function findRelevantMemories(input: string): SymbolicMemoryNode[] {
  const all = loadSymbolicMemory();
  const lowerInput = input.toLowerCase();

  return all.filter((node) =>
    node.activationCue.some(cue => lowerInput.includes(cue.toLowerCase()))
  );
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