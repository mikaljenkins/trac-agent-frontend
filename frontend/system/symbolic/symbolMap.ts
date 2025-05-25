import * as fs from 'fs/promises';
import { join } from 'path';

export interface SymbolEntry {
  frequency: number;
  modules: Set<string>;
  related: Set<string>;
  lastSeen: string;
  sourceModule: string;
  issue: string;
}

export async function generateSymbolMap(): Promise<Record<string, SymbolEntry>> {
  const logPath = join(process.cwd(), 'logs', 'weekly-reflections.jsonl');
  const lines = (await fs.readFile(logPath, 'utf-8')).trim().split('\n');
  const symbolMap: Record<string, SymbolEntry> = {};

  for (const line of lines) {
    const entry = JSON.parse(line);
    const reflections = entry.reflection || [];

    for (const r of reflections) {
      const sourceModule = r.sourceModule ?? 'unknown';
      const issue = r.issue ?? 'unspecified';
      const key = `${sourceModule}-${issue}`;
      
      if (!symbolMap[key]) {
        symbolMap[key] = {
          frequency: 0,
          modules: new Set([sourceModule]),
          related: new Set(),
          lastSeen: entry.timestamp ?? new Date().toISOString(),
          sourceModule,
          issue
        };
      }
      
      symbolMap[key].frequency++;
      symbolMap[key].modules.add(sourceModule);
      symbolMap[key].lastSeen = entry.timestamp ?? new Date().toISOString();
      
      // If there are related terms in the reflection, add them
      if (r.relatedTerms && Array.isArray(r.relatedTerms)) {
        r.relatedTerms.forEach((term: string) => symbolMap[key].related.add(term));
      }
    }
  }

  return symbolMap;
} 