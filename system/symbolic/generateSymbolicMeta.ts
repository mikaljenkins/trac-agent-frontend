import * as fs from 'fs/promises';
import { join } from 'path';
import type { ImprovementCandidate } from '../../types/agent';

interface MetaStats {
  totalReflections: number;
  moduleFrequency: Record<string, number>;
  issueFrequency: Record<string, number>;
  averageConfidence: number;
  topIssues: Array<{ issue: string; count: number }>;
}

export async function generateSymbolicMeta(): Promise<MetaStats> {
  const filePath = join(process.cwd(), 'logs', 'weekly-reflections.jsonl');

  const raw = await fs.readFile(filePath, 'utf-8');
  const lines = raw.trim().split('\n');

  const reflections: ImprovementCandidate[] = [];

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      if (Array.isArray(entry.reflection)) {
        reflections.push(...entry.reflection);
      }
    } catch {
      continue;
    }
  }

  const moduleFrequency: Record<string, number> = {};
  const issueFrequency: Record<string, number> = {};
  let confidenceTotal = 0;
  let confidenceCount = 0;

  for (const ref of reflections) {
    const module = ref.sourceModule || 'unknown';
    const issue = ref.issue || 'unspecified';

    moduleFrequency[module] = (moduleFrequency[module] || 0) + 1;
    issueFrequency[issue] = (issueFrequency[issue] || 0) + 1;

    if (Array.isArray(ref.confidenceTrend)) {
      for (const score of ref.confidenceTrend) {
        confidenceTotal += score;
        confidenceCount += 1;
      }
    }
  }

  const sortedIssues = Object.entries(issueFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([issue, count]) => ({ issue, count }));

  return {
    totalReflections: reflections.length,
    moduleFrequency,
    issueFrequency,
    averageConfidence: confidenceCount ? confidenceTotal / confidenceCount : 0,
    topIssues: sortedIssues,
  };
} 