import { invokeLLM } from '@/llm/invokeLLM';
import type { AgentInput, AgentResult, AgentState } from '@/types/agent';
import type { ImprovementCandidate } from '@/types/symbolic';
import * as fs from 'fs/promises';
import { join } from 'path';

export interface WeeklySynthesis {
  weekStarting: string;
  weekEnding: string;
  insights: Array<{
    category: string;
    insight: string;
    confidence: number;
  }>;
  overallProgress: number;
  nextSteps: string[];
  weeklyStats: {
    week: string;
    entryCount: number;
    reflectionCount: number;
    summary: string;
  }[];
}

interface JournalEntry {
  input: AgentInput;
  result: AgentResult;
  reflection: ImprovementCandidate[];
  state: AgentState;
  timestamp: string;
}

interface ReflectionEntry {
  reflection: {
    sourceModule?: string;
    issue?: string;
    proposedFix?: string;
    confidenceTrend?: number[];
  }[];
  timestamp: string;
}

export async function runWeeklySynthesis(): Promise<WeeklySynthesis> {
  // Get weekly reflection data
  const logPath = join(process.cwd(), 'logs', 'weekly-reflections.jsonl');
  const lines = (await fs.readFile(logPath, 'utf-8')).trim().split('\n');
  const entries: ReflectionEntry[] = lines.map(l => JSON.parse(l));

  // Group by week
  const weeks: Record<string, ReflectionEntry[]> = {};
  for (const entry of entries) {
    const week = new Date(entry.timestamp).toISOString().slice(0, 10);
    if (!weeks[week]) weeks[week] = [];
    weeks[week].push(entry);
  }

  // Generate weekly stats
  const weeklyStats = Object.entries(weeks).map(([week, list]) => {
    const count = list.flatMap(e => e.reflection).length;
    return {
      week,
      entryCount: list.length,
      reflectionCount: count,
      summary: `Week ${week} had ${list.length} entries, ${count} reflections.`
    };
  });

  // Get LLM insights
  const result = await invokeLLM({
    prompt: 'Synthesize weekly symbolic patterns and insights',
    systemMessage: 'You are a reflection system analyzing weekly patterns and generating insights.'
  });

  // For now return mock data with real weekly stats
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - 7));
  
  return {
    weekStarting: weekStart.toISOString(),
    weekEnding: new Date().toISOString(),
    insights: [
      {
        category: 'Learning',
        insight: 'Increased pattern recognition in symbolic processing',
        confidence: 0.85
      },
      {
        category: 'Trust',
        insight: 'Stable trust metrics with positive trend',
        confidence: 0.9
      }
    ],
    overallProgress: 0.75,
    nextSteps: [
      'Enhance symbolic pattern detection',
      'Strengthen trust validation mechanisms',
      'Expand learning domains'
    ],
    weeklyStats
  };
}

export async function journalReflection(entry: JournalEntry) {
  const logPath = join(process.cwd(), 'logs', 'weekly-reflections.jsonl');
  const serialized = JSON.stringify(entry);

  await fs.mkdir(join(process.cwd(), 'logs'), { recursive: true });
  await fs.appendFile(logPath, serialized + '\n', 'utf-8');
}

export function synthesizeWeeklyReflections(
  weeklyReflections: ImprovementCandidate[]
): ImprovementCandidate[] {
  const synthesized: ImprovementCandidate[] = [];
  const issueGroups: Record<string, ImprovementCandidate[]> = {};

  // Group by sourceModule and issue
  for (const reflection of weeklyReflections) {
    const key = `${reflection.sourceModule}-${reflection.issue}`;
    if (!issueGroups[key]) {
      issueGroups[key] = [];
    }
    issueGroups[key].push({
      sourceModule: reflection.sourceModule,
      issue: reflection.issue,
      proposedFix: reflection.proposedFix,
      triggerCount: reflection.triggerCount,
      confidenceTrend: reflection.confidenceTrend
    });
  }

  // Synthesize each group
  for (const group of Object.values(issueGroups)) {
    const totalTriggers = group.reduce((sum, r) => sum + r.triggerCount, 0);
    const allConfidenceTrends = group.flatMap(r => r.confidenceTrend);
    const avgConfidence = allConfidenceTrends.reduce((sum, c) => sum + c, 0) / allConfidenceTrends.length;

    synthesized.push({
      sourceModule: group[0].sourceModule,
      issue: group[0].issue,
      proposedFix: group[0].proposedFix,
      triggerCount: totalTriggers,
      confidenceTrend: [avgConfidence]
    });
  }

  return synthesized;
}