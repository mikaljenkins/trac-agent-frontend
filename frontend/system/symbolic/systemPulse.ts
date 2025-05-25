import { runSymbolicCompass } from '@/system/symbolic/symbolicCompass';
import { generateSymbolMap, type SymbolEntry } from '@/system/symbolic/symbolMap';
import type { SystemPulse } from '@/types/symbolic';
import { detectSymbolDrift } from './symbolDriftTracker';

export async function runSystemPulse(): Promise<SystemPulse> {
  const drift = await detectSymbolDrift();
  const symbolMap = await generateSymbolMap();
  const compass = await runSymbolicCompass();

  const entries = Object.values(symbolMap) as SymbolEntry[];
  const total = entries.length;
  const topFrequency = total > 0 ? Math.max(...entries.map((s: SymbolEntry) => s.frequency)) : 0;
  const averageFrequency = total > 0 ? entries.reduce((sum: number, s: SymbolEntry) => sum + s.frequency, 0) / total : 0;

  const pulse: SystemPulse = {
    timestamp: new Date().toISOString(),
    drift: {
      decayed: drift.decayedSymbols.length,
      persistent: drift.persistentSymbols.length,
      transformed: drift.transformedSymbols.length
    },
    symbols: {
      total,
      topFrequency,
      averageFrequency
    },
    compass: {
      topSymbols: compass.topSymbols,
      stagnantCount: compass.stagnantSymbols.length
    }
  };

  console.log('\n💓 System Pulse Report:\n');
  console.dir(pulse, { depth: null });

  return pulse;
}

export function analyzeSystemPulse(symbolMap: Record<string, SymbolEntry>) {
  const entries = Object.values(symbolMap);
  const totalSymbols = entries.length;

  if (totalSymbols === 0) {
    return {
      totalSymbols: 0,
      topFrequency: 0,
      averageFrequency: 0,
      recentActivity: []
    };
  }

  return {
    totalSymbols,
    topFrequency: Math.max(...entries.map((s: SymbolEntry) => s.frequency)),
    averageFrequency: entries.reduce((sum: number, s: SymbolEntry) => sum + s.frequency, 0) / totalSymbols,
    recentActivity: entries
      .sort((a: SymbolEntry, b: SymbolEntry) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())
      .slice(0, 5)
      .map((s: SymbolEntry) => ({
        sourceModule: s.sourceModule,
        issue: s.issue,
        frequency: s.frequency,
        lastSeen: s.lastSeen
      }))
  };
} 