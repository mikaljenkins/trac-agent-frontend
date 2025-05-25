import * as fs from 'fs/promises';
import { join } from 'path';
import type { ImprovementCandidate } from '../../types/agent';

interface DriftResult {
  decayedSymbols: string[];
  persistentSymbols: string[];
  transformedSymbols: {
    issue: string;
    originalModules: string[];
    currentModules: string[];
    fixChanged: boolean;
  }[];
}

export async function detectSymbolDrift(): Promise<DriftResult> {
  const logPath = join(process.cwd(), 'logs', 'weekly-reflections.jsonl');
  const raw = await fs.readFile(logPath, 'utf-8');
  const lines = raw.trim().split('\n');

  const weeks: Record<string, ImprovementCandidate[]> = {};

  for (const line of lines) {
    const entry = JSON.parse(line);
    const week = new Date(entry.timestamp).toISOString().slice(0, 10); // yyyy-mm-dd
    if (!weeks[week]) weeks[week] = [];
    if (Array.isArray(entry.reflection)) {
      weeks[week].push(...entry.reflection);
    }
  }

  const weekKeys = Object.keys(weeks).sort();
  const recentWeeks = weekKeys.slice(-4); // Analyze last 4 weeks
  const pastWeeks = weekKeys.slice(0, -4);

  const seen = new Map<string, { modules: Set<string>; fixes: Set<string> }>();
  const recent = new Map<string, { modules: Set<string>; fixes: Set<string> }>();

  function track(map: Map<string, any>, reflection: ImprovementCandidate) {
    if (!reflection.issue) return;
    const entry = map.get(reflection.issue) || { modules: new Set(), fixes: new Set() };
    if (reflection.sourceModule) entry.modules.add(reflection.sourceModule);
    if (reflection.proposedFix) entry.fixes.add(reflection.proposedFix);
    map.set(reflection.issue, entry);
  }

  for (const week of pastWeeks) {
    for (const ref of weeks[week]) track(seen, ref);
  }

  for (const week of recentWeeks) {
    for (const ref of weeks[week]) track(recent, ref);
  }

  const decayedSymbols = [...seen.keys()].filter(key => !recent.has(key));
  const persistentSymbols = [...seen.keys()].filter(
    key => recent.has(key) && recentWeeks.every(week => weeks[week].some(r => r.issue === key))
  );

  const transformedSymbols = [...recent.keys()].flatMap(issue => {
    if (!seen.has(issue)) return [];
    const original = seen.get(issue)!;
    const current = recent.get(issue)!;
    return [{
      issue,
      originalModules: [...original.modules],
      currentModules: [...current.modules],
      fixChanged: [...original.fixes][0] !== [...current.fixes][0],
    }];
  });

  return { decayedSymbols, persistentSymbols, transformedSymbols };
}

if (process.argv.includes('--drift')) {
  detectSymbolDrift().then(result => {
    console.log('📉 Symbol Drift Report:\n');
    console.dir(result, { depth: null });
    process.exit(0);
  });
} 