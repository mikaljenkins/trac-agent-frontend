import type { DriftResult, ReflectionEntry } from '@/types/symbolic';
import * as fs from 'fs/promises';
import { join } from 'path';

export async function detectSymbolDrift(): Promise<DriftResult> {
  const logPath = join(process.cwd(), 'logs', 'weekly-reflections.jsonl');
  const lines = (await fs.readFile(logPath, 'utf-8')).trim().split('\n');
  const entries: ReflectionEntry[] = lines.map(l => JSON.parse(l));

  const seen: Record<string, number[]> = {};

  for (let i = 0; i < entries.length; i++) {
    const { reflection } = entries[i];
    for (const r of reflection || []) {
      const key = r.issue || 'unspecified';
      if (!seen[key]) seen[key] = [];
      seen[key].push(i);
    }
  }

  const decayed = Object.entries(seen).filter(([_, v]) => {
    return v[v.length - 1] < entries.length - 3;
  }).map(([k]) => k);

  return {
    decayedSymbols: decayed,
    persistentSymbols: Object.keys(seen).filter(k => !decayed.includes(k)),
    transformedSymbols: [] // not implemented yet
  };
} 