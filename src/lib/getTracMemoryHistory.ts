import { getMemoryLog, getRecentTriggers, getTriggersByNodeId, getActiveMemoryNodes, MemoryTriggerEntry } from './memory/memoryLog';

export interface FormattedMemoryHistory {
  recent: MemoryTriggerEntry[];
  byNode: Record<string, MemoryTriggerEntry[]>;
  activeNodes: MemoryTriggerEntry[];
  summary: {
    totalTriggers: number;
    uniqueNodes: number;
    lastTriggered: number | null;
  };
}

export async function getTracMemoryHistory(): Promise<FormattedMemoryHistory> {
  const allTriggers = getMemoryLog();
  const recent = getRecentTriggers(10);
  const activeNodes = getActiveMemoryNodes();

  // Group triggers by node ID
  const byNode: Record<string, MemoryTriggerEntry[]> = {};
  allTriggers.forEach(trigger => {
    if (!byNode[trigger.id]) {
      byNode[trigger.id] = [];
    }
    byNode[trigger.id].push(trigger);
  });

  // Calculate summary statistics
  const summary = {
    totalTriggers: allTriggers.length,
    uniqueNodes: Object.keys(byNode).length,
    lastTriggered: recent[0]?.triggeredAt || null
  };

  return {
    recent,
    byNode,
    activeNodes,
    summary
  };
}

// Helper to format timestamps for display
export function formatMemoryTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Helper to get memory activation timeline
export function getMemoryTimeline(nodeId: string): MemoryTriggerEntry[] {
  return getTriggersByNodeId(nodeId)
    .sort((a, b) => a.triggeredAt - b.triggeredAt);
} 