import { SymbolicMemoryNode } from './types';

export type MemoryTriggerEntry = {
  id: string;
  title: string;
  triggeredAt: number;
  input: string;
  node: SymbolicMemoryNode;
  context?: {
    weight: number;
    status: string;
    usageCount: number;
  };
};

let memoryLog: MemoryTriggerEntry[] = [];

export const logMemoryTrigger = (entry: MemoryTriggerEntry) => {
  memoryLog.push(entry);
};

export const getMemoryLog = () => [...memoryLog];

export const clearMemoryLog = () => {
  memoryLog = [];
};

export const getRecentTriggers = (limit: number = 10) => {
  return [...memoryLog]
    .sort((a, b) => b.triggeredAt - a.triggeredAt)
    .slice(0, limit);
};

export const getTriggersByNodeId = (nodeId: string) => {
  return memoryLog.filter(entry => entry.id === nodeId);
};

export const getActiveMemoryNodes = () => {
  const uniqueNodes = new Map<string, MemoryTriggerEntry>();
  
  // Get most recent trigger for each node
  memoryLog.forEach(entry => {
    if (!uniqueNodes.has(entry.id) || 
        entry.triggeredAt > uniqueNodes.get(entry.id)!.triggeredAt) {
      uniqueNodes.set(entry.id, entry);
    }
  });

  return Array.from(uniqueNodes.values());
}; 