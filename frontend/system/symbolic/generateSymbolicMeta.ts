import * as fs from 'fs/promises';
import { join } from 'path';

interface ReflectionEntry {
  reflection: {
    sourceModule?: string;
    issue?: string;
    confidenceTrend?: number[];
  }[];
}

interface SymbolicMeta {
  totalReflections: number;
  moduleFrequency: Record<string, number>;
  issueFrequency: Record<string, number>;
  averageConfidence: number;
  topIssues: { issue: string; count: number }[];
}

export async function generateSymbolicMeta(): Promise<SymbolicMeta> {
  const logPath = join(process.cwd(), 'logs', 'weekly-reflections.jsonl');
  const moduleFrequency: Record<string, number> = {};
  const issueFrequency: Record<string, number> = {};
  const confidences: number[] = [];

  try {
    const raw = await fs.readFile(logPath, 'utf-8');
    const lines = raw.trim().split('\n');
    const entries: ReflectionEntry[] = lines.map(line => JSON.parse(line));

    for (const entry of entries) {
      for (const r of entry.reflection || []) {
        const mod = r.sourceModule || 'unknown';
        const issue = r.issue || 'unspecified';

        moduleFrequency[mod] = (moduleFrequency[mod] || 0) + 1;
        issueFrequency[issue] = (issueFrequency[issue] || 0) + 1;

        if (Array.isArray(r.confidenceTrend)) {
          confidences.push(...r.confidenceTrend);
        }
      }
    }

    const total = confidences.length;
    const avg = total > 0 ? confidences.reduce((a, b) => a + b, 0) / total : 0;

    const topIssues = Object.entries(issueFrequency)
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalReflections: entries.length,
      moduleFrequency,
      issueFrequency,
      averageConfidence: parseFloat(avg.toFixed(2)),
      topIssues,
    };
  } catch (err) {
    throw new Error(`Error generating symbolic meta: ${err.message}`);
  }
} 