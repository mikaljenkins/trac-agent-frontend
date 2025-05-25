import { readFileSync } from 'fs';
import { join } from 'path';
import { ImprovementCandidate } from '../../types/agent';

const logPath = join(process.cwd(), 'logs', 'weekly-reflections.jsonl');

interface SymbolMap {
  [symbol: string]: {
    frequency: number;
    modules: Set<string>;
    related: Set<string>;
  };
}

export interface SymbolData {
  frequency: number;
  modules: string[];
  related: string[];
}

export async function generateSymbolMap(): Promise<Record<string, SymbolData>> {
  const raw = readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);
  const map: SymbolMap = {};

  for (const line of raw) {
    const entry = JSON.parse(line);
    const reflections: ImprovementCandidate[] = entry.reflection || [];

    reflections.forEach(ref => {
      const issue = ref.issue || 'unspecified';
      const module = ref.sourceModule || 'unknown';

      if (!map[issue]) {
        map[issue] = {
          frequency: 0,
          modules: new Set(),
          related: new Set()
        };
      }

      map[issue].frequency += 1;
      map[issue].modules.add(module);

      // crude symbolic linking (can be replaced with NLP later)
      if (ref.proposedFix) {
        const words = ref.proposedFix.toLowerCase().split(/\s+/);
        words.forEach(w => {
          if (w.length > 4) map[issue].related.add(w);
        });
      }
    });
  }

  // Serialize Sets into arrays for readability
  const serialized = Object.fromEntries(
    Object.entries(map).map(([k, v]) => [
      k,
      {
        frequency: v.frequency,
        modules: Array.from(v.modules),
        related: Array.from(v.related)
      }
    ])
  );

  console.log('\n🧠 Symbol Map Generated:\n');
  console.dir(serialized, { depth: null });

  return serialized;
} 