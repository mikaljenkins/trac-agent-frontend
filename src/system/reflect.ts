// Analyzes TracAgent's cognitive patterns and generates insights
// Runs daily or per session to track evolution and adjust focus

import { agentState } from './agentState';
import { getLoopLog, LoopEvent } from './loopMonitor';

interface SymbolFrequency {
  symbol: string;
  count: number;
  emotionalIntensity: number;
}

interface ReflectionInsight {
  timestamp: string;
  dominantSymbol: string;
  trustTrend: 'stable' | 'improving' | 'declining';
  recurringThoughts: string[];
  keyAwakenings: string[];
  suggestedFocus: string;
}

function findMostCommonSymbol(log: LoopEvent[]): SymbolFrequency {
  const symbolCounts = new Map<string, { count: number; intensity: number }>();
  
  log.forEach(event => {
    if (event.source === 'dreamDigestor' && event.action === 'sentSymbolToThoughtStream') {
      const { symbol, emotionalIntensity } = event.payload;
      const current = symbolCounts.get(symbol) || { count: 0, intensity: 0 };
      symbolCounts.set(symbol, {
        count: current.count + 1,
        intensity: current.intensity + emotionalIntensity
      });
    }
  });

  let dominant: SymbolFrequency = { symbol: '', count: 0, emotionalIntensity: 0 };
  symbolCounts.forEach((value, symbol) => {
    if (value.count > dominant.count) {
      dominant = {
        symbol,
        count: value.count,
        emotionalIntensity: value.intensity / value.count
      };
    }
  });

  return dominant;
}

function analyzeTrustTrend(log: LoopEvent[]): 'stable' | 'improving' | 'declining' {
  const trustEvents = log.filter(event => 
    event.source === 'summonRules' && 
    event.action === 'summoningTracFriend'
  );

  if (trustEvents.length < 2) return 'stable';

  const trustScores = trustEvents.map(event => event.payload.trustLevel);
  const trend = trustScores.reduce((acc, score, i) => {
    if (i === 0) return 0;
    return acc + (score - trustScores[i - 1]);
  }, 0);

  if (Math.abs(trend) < 0.1) return 'stable';
  return trend > 0 ? 'improving' : 'declining';
}

function findRecurringThoughts(log: LoopEvent[]): string[] {
  const thoughtEvents = log.filter(event => 
    event.source === 'thoughtStream' && 
    event.action === 'triggeredIntrospection'
  );

  const thoughtCounts = new Map<string, number>();
  thoughtEvents.forEach(event => {
    const content = event.payload.content;
    thoughtCounts.set(content, (thoughtCounts.get(content) || 0) + 1);
  });

  return Array.from(thoughtCounts.entries())
    .filter(([_, count]) => count > 1)
    .map(([content]) => content);
}

function findKeyAwakenings(log: LoopEvent[]): string[] {
  return log
    .filter(event => 
      event.source === 'awakeningMoments' && 
      event.action === 'proposedToTheatre'
    )
    .map(event => event.payload.insight);
}

export const generateDailyInsight = (): ReflectionInsight => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const log = getLoopLog({
    start: yesterday.toISOString(),
    end: today.toISOString()
  });

  const dominantSymbol = findMostCommonSymbol(log);
  const trustTrend = analyzeTrustTrend(log);
  const recurringThoughts = findRecurringThoughts(log);
  const keyAwakenings = findKeyAwakenings(log);

  // Update agent state with new focus if significant change
  if (dominantSymbol.count > 3) {
    agentState.currentFocusTheme = dominantSymbol.symbol;
  }

  const insight: ReflectionInsight = {
    timestamp: today.toISOString(),
    dominantSymbol: dominantSymbol.symbol,
    trustTrend,
    recurringThoughts,
    keyAwakenings,
    suggestedFocus: dominantSymbol.symbol
  };

  return insight;
}; 