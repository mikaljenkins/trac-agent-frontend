import * as fs from 'fs/promises';
import { join } from 'path';
import type { ImprovementCandidate } from '../../types/agent';

interface PrioritizedFix {
  module: string;
  issue: string;
  proposedFix: string;
  urgencyScore: number;
}

function scoreUrgency(candidate: ImprovementCandidate): number {
  const trigger = candidate.triggerCount ?? 0;
  const confidenceTrend = candidate.confidenceTrend ?? [];

  const latestConfidence = confidenceTrend.at(-1) ?? 1;
  const trend = confidenceTrend.length > 1
    ? confidenceTrend[confidenceTrend.length - 1] - confidenceTrend[0]
    : 0;

  const confidencePenalty = 1 - latestConfidence;
  const trendPenalty = trend < 0 ? Math.abs(trend) * 0.5 : 0;

  const score = (trigger * 0.3) + (confidencePenalty * 0.5) + trendPenalty;
  return Math.min(1, Math.max(0, parseFloat(score.toFixed(2))));
}

export async function generatePriorityQueue(): Promise<PrioritizedFix[]> {
  const logPath = join(process.cwd(), 'logs', 'weekly-reflections.jsonl');
  const data = await fs.readFile(logPath, 'utf-8');
  const lines = data.split('\n').filter(Boolean);

  const issues: Record<string, ImprovementCandidate> = {};

  for (const line of lines) {
    const entry = JSON.parse(line);
    for (const reflection of entry.reflection ?? []) {
      const key = `${reflection.sourceModule}-${reflection.issue}`;
      if (!issues[key]) issues[key] = { ...reflection };
      else {
        issues[key].triggerCount = (issues[key].triggerCount ?? 1) + 1;
        const newTrend = reflection.confidenceTrend ?? [];
        issues[key].confidenceTrend = [
          ...(issues[key].confidenceTrend ?? []),
          ...newTrend
        ];
      }
    }
  }

  const prioritized: PrioritizedFix[] = Object.values(issues)
    .map(ref => ({
      module: ref.sourceModule ?? 'unknown',
      issue: ref.issue ?? 'unspecified',
      proposedFix: ref.proposedFix ?? 'none proposed',
      urgencyScore: scoreUrgency(ref),
    }))
    .sort((a, b) => b.urgencyScore - a.urgencyScore);

  return prioritized;
}

if (process.argv.includes('--run')) {
  generatePriorityQueue().then(queue => {
    console.log('\n🧭 TracAgent Evolution Priority Queue:\n');
    console.log(JSON.stringify(queue, null, 2));
  });
} 