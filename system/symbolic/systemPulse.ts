import { detectSymbolDrift } from './symbolDriftTracker';
import { generateSymbolMap } from './symbolMap';
import { runSymbolicCompass } from './symbolicCompass';

interface SystemPulse {
  timestamp: string;
  drift: {
    decayed: number;
    persistent: number;
    transformed: number;
  };
  symbols: {
    total: number;
    topFrequency: number;
    averageFrequency: number;
  };
  compass: {
    topSymbols: string[];
    stagnantCount: number;
  };
}

export async function runSystemPulse(): Promise<SystemPulse> {
  const drift = await detectSymbolDrift();
  const symbols = await generateSymbolMap();
  const compass = await runSymbolicCompass();

  const pulse: SystemPulse = {
    timestamp: new Date().toISOString(),
    drift: {
      decayed: drift.decayedSymbols.length,
      persistent: drift.persistentSymbols.length,
      transformed: drift.transformedSymbols.length
    },
    symbols: {
      total: Object.keys(symbols).length,
      topFrequency: Math.max(...Object.values(symbols).map(s => s.frequency)),
      averageFrequency: Object.values(symbols).reduce((sum, s) => sum + s.frequency, 0) / Object.keys(symbols).length
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