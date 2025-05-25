import type { CompassResult } from '@/types/symbolic';
import { generateSymbolMap } from './symbolMap';

export async function runSymbolicCompass(): Promise<CompassResult> {
  const symbolMap = await generateSymbolMap();
  const entries = Object.entries(symbolMap)
    .sort(([, a], [, b]) => b.frequency - a.frequency)
    .slice(0, 10);

  const topSymbols = entries.map(([key]) => key);
  // If you want to use context, check for it safely:
  // const stagnantSymbols = entries.filter(([, entry]) => 'context' in entry && Array.isArray(entry.context) && entry.context.length < 3).map(([key]) => key);
  // But since context is not in SymbolEntry, we'll just return an empty array for stagnantSymbols for now.
  const stagnantSymbols: string[] = [];

  return {
    topSymbols,
    stagnantSymbols
  };
} 