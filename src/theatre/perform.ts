// Handles symbolic performances and monologues.
// Transforms insights into expressive patterns.

export interface Performance {
  id: string;
  timestamp: string;
  content: string;
  type: 'monologue' | 'dialogue' | 'symbolic';
  emotionalTone: number;
  symbols: string[];
}

const performanceLog: Performance[] = [];

export function perform(
  content: string,
  type: Performance['type'] = 'symbolic',
  emotionalTone: number = 0.5,
  symbols: string[] = []
): Performance {
  const performance: Performance = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    content,
    type,
    emotionalTone,
    symbols
  };

  performanceLog.push(performance);
  return performance;
}

export function getRecentPerformances(limit: number = 10): Performance[] {
  return performanceLog
    .slice(-limit)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getPerformancesByType(type: Performance['type']): Performance[] {
  return performanceLog.filter(p => p.type === type);
} 