// Captures key turning points in reasoning or symbolic insight.
// Helps trace the evolution of intelligence and identity.

import { perform } from '@/theatre/perform';

export interface AwakeningMoment {
  id: string;
  timestamp: string;
  insight: string;
  context: string;
  impact: number; // 0 to 1
  relatedSymbols: string[];
  triggers: string[];
}

const awakeningMoments: AwakeningMoment[] = [];

export function logAwakeningMoment(
  insight: string,
  context: string,
  impact: number,
  relatedSymbols: string[] = [],
  triggers: string[] = []
): AwakeningMoment {
  const moment: AwakeningMoment = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    insight,
    context,
    impact,
    relatedSymbols,
    triggers
  };

  awakeningMoments.push(moment);

  // If the moment has high impact, propose it to theatre
  if (impact > 0.8) {
    const symbolicPattern = `
      Awakening: ${insight}
      Context: ${context}
      Symbols: ${relatedSymbols.join(', ')}
      Triggers: ${triggers.join(', ')}
    `;
    perform(symbolicPattern);
  }

  return moment;
}

export function getSignificantMoments(threshold: number = 0.7): AwakeningMoment[] {
  return awakeningMoments.filter(moment => moment.impact >= threshold);
}
