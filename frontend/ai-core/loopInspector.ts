import { AgentState } from './agentState';
import { SymbolicMemoryNode } from './memorySync';

export interface LoopCycleReport {
  loopType: string;
  startTimestamp: string;
  endTimestamp: string;
  durationMinutes: number;
  resolution?: string;
  wasResolved: boolean;
  triggerSymbols: string[];
  exitSymbols: string[];
}

export interface StuckLoopReport {
  loopType: string;
  triggerCount: number;
  lastTriggered: string;
  unresolvedDuration: number;
  commonSymbols: string[];
}

export interface LoopChangeReport {
  fromType: string;
  toType: string;
  timestamp: string;
  catalystSymbols: string[];
  confidence: number;
}

/**
 * Analyzes completed loops in agent state.
 * Returns detailed reports of loop cycles with timing and resolution data.
 */
export function trackCompletedLoops(state: AgentState): LoopCycleReport[] {
  const reports: LoopCycleReport[] = [];
  const loopHistory = state.loopHistory || [];
  
  for (const loop of loopHistory) {
    if (!loop.endTimestamp) continue;
    
    const startTime = new Date(loop.startTimestamp);
    const endTime = new Date(loop.endTimestamp);
    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    
    reports.push({
      loopType: loop.type,
      startTimestamp: loop.startTimestamp,
      endTimestamp: loop.endTimestamp,
      durationMinutes,
      resolution: loop.resolution,
      wasResolved: loop.wasResolved,
      triggerSymbols: loop.triggerSymbols || [],
      exitSymbols: loop.exitSymbols || []
    });
  }
  
  return reports.sort((a, b) => 
    new Date(b.endTimestamp).getTime() - new Date(a.endTimestamp).getTime()
  );
}

/**
 * Identifies loops that are repeatedly triggered without resolution.
 * Helps detect stuck patterns in agent behavior.
 */
export function getStuckLoops(state: AgentState): StuckLoopReport[] {
  const stuckLoops = new Map<string, StuckLoopReport>();
  const loopHistory = state.loopHistory || [];
  const now = new Date();
  
  // Group loops by type
  for (const loop of loopHistory) {
    if (loop.wasResolved) continue;
    
    const existing = stuckLoops.get(loop.type) || {
      loopType: loop.type,
      triggerCount: 0,
      lastTriggered: loop.startTimestamp,
      unresolvedDuration: 0,
      commonSymbols: []
    };
    
    existing.triggerCount++;
    existing.lastTriggered = loop.startTimestamp;
    existing.unresolvedDuration = (now.getTime() - new Date(loop.startTimestamp).getTime()) / (1000 * 60);
    
    // Track common trigger symbols
    if (loop.triggerSymbols) {
      existing.commonSymbols = [...new Set([
        ...existing.commonSymbols,
        ...loop.triggerSymbols
      ])];
    }
    
    stuckLoops.set(loop.type, existing);
  }
  
  return Array.from(stuckLoops.values())
    .filter(loop => loop.triggerCount > 1)
    .sort((a, b) => b.triggerCount - a.triggerCount);
}

/**
 * Analyzes recent changes in loop patterns.
 * Helps identify shifts in agent behavior and thinking patterns.
 */
export function summarizeRecentLoopChanges(state: AgentState): LoopChangeReport[] {
  const changes: LoopChangeReport[] = [];
  const loopHistory = state.loopHistory || [];
  
  // Sort by start time
  const sortedLoops = [...loopHistory].sort((a, b) => 
    new Date(a.startTimestamp).getTime() - new Date(b.startTimestamp).getTime()
  );
  
  // Analyze consecutive loops for changes
  for (let i = 1; i < sortedLoops.length; i++) {
    const prevLoop = sortedLoops[i - 1];
    const currentLoop = sortedLoops[i];
    
    if (prevLoop.type !== currentLoop.type) {
      // Calculate confidence based on symbol overlap
      const prevSymbols = new Set(prevLoop.exitSymbols || []);
      const currentSymbols = new Set(currentLoop.triggerSymbols || []);
      const overlap = new Set([...prevSymbols].filter(x => currentSymbols.has(x)));
      const confidence = overlap.size / Math.max(prevSymbols.size, currentSymbols.size);
      
      changes.push({
        fromType: prevLoop.type,
        toType: currentLoop.type,
        timestamp: currentLoop.startTimestamp,
        catalystSymbols: Array.from(overlap),
        confidence
      });
    }
  }
  
  return changes.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Calculates loop health metrics based on completion rates and durations.
 */
export function calculateLoopHealth(state: AgentState): {
  completionRate: number;
  averageDuration: number;
  stuckLoopCount: number;
  healthScore: number;
} {
  const reports = trackCompletedLoops(state);
  const stuckLoops = getStuckLoops(state);
  
  const totalLoops = reports.length + stuckLoops.length;
  const completedLoops = reports.filter(r => r.wasResolved).length;
  const completionRate = totalLoops > 0 ? completedLoops / totalLoops : 0;
  
  const averageDuration = reports.length > 0
    ? reports.reduce((sum, r) => sum + r.durationMinutes, 0) / reports.length
    : 0;
  
  // Health score combines completion rate, duration efficiency, and stuck loop impact
  const durationScore = Math.max(0, 1 - (averageDuration / 60)); // Normalize to 1 hour
  const stuckImpact = Math.max(0, 1 - (stuckLoops.length / 5)); // Normalize to 5 stuck loops
  
  const healthScore = (completionRate * 0.4 + durationScore * 0.3 + stuckImpact * 0.3);
  
  return {
    completionRate,
    averageDuration,
    stuckLoopCount: stuckLoops.length,
    healthScore
  };
} 