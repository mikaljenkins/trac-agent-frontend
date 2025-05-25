import { removeCircular } from '@/lib/utils';
import { reflectWithLLM } from '@/system/symbolic/reflectWithLLM';
import { detectSymbolDrift } from '@/system/symbolic/symbolDriftTracker';
import { generateSymbolMap } from '@/system/symbolic/symbolMap';
import type { AgentInput, AgentResult, AgentState } from '@/types/agent';
import type { EvolutionPlan, ImprovementCandidate } from '@/types/symbolic';
import * as fs from 'fs/promises';
import { join } from 'path';

export async function evaluateForEvolution(
  state: AgentState,
  input: AgentInput,
  result: AgentResult
): Promise<EvolutionPlan> {
  const logPath = join(process.cwd(), 'logs', 'evolution-plans.jsonl');
  const drift = await detectSymbolDrift();
  const symbols = await generateSymbolMap();
  const plans: EvolutionPlan[] = [];
  const symbolicPlanLog: EvolutionPlan[] = [];

  // Add symbolic evolution routing
  if (state.pendingImprovements?.length) {
    for (const candidate of state.pendingImprovements) {
      symbolicPlanLog.push({
        action: 'INVESTIGATE',
        reason: `Pending improvement: ${candidate.issue}`,
        targetModule: candidate.sourceModule,
        origin: 'skillMonitor/desireLoop'
      });
    }
  }

  // Evaluate decayed symbols
  for (const symbol of drift.decayedSymbols) {
    const urgency = calculateUrgency(symbol, symbols);
    if (urgency > 0.7) {
      const context = `Symbol "${symbol}" has decayed and requires attention. Current urgency: ${urgency}`;
      const llmInsight = await reflectWithLLM(state, context);
      
      plans.push({
        action: 'REINVESTIGATE',
        reason: `Decayed symbol: ${symbol}`,
        urgency,
        sourceModule: 'symbolDriftTracker',
        llmInsight
      });
    }
  }

  // Evaluate persistent symbols
  for (const symbol of drift.persistentSymbols) {
    const urgency = calculateUrgency(symbol, symbols);
    if (urgency > 0.7) {
      const context = `Symbol "${symbol}" has shown persistent behavior. Current urgency: ${urgency}`;
      const llmInsight = await reflectWithLLM(state, context);
      
      plans.push({
        action: 'REINFORCE',
        reason: `Persistent symbol: ${symbol}`,
        urgency,
        sourceModule: 'symbolDriftTracker',
        llmInsight
      });
    }
  }

  // Evaluate transformed symbols
  for (const symbol of drift.transformedSymbols) {
    const urgency = calculateUrgency(symbol, symbols);
    if (urgency > 0.7) {
      const context = `Symbol "${symbol}" has transformed. Current urgency: ${urgency}`;
      const llmInsight = await reflectWithLLM(state, context);
      
      plans.push({
        action: 'INTEGRATE',
        reason: `Transformed symbol: ${symbol}`,
        urgency,
        sourceModule: 'symbolDriftTracker',
        llmInsight
      });
    }
  }

  // Process pending improvements
  const reflections = state.pendingImprovements || [];
  for (const reflection of reflections) {
    const urgency = calculateUrgency(reflection.issue || 'unspecified', symbols);
    if (reflection.triggerCount >= 3 || urgency > 0.6) {
      plans.push({
        action: 'IMPROVE',
        reason: `Triggered ${reflection.triggerCount} times or urgency ${urgency}`,
        urgency,
        sourceModule: reflection.sourceModule,
        targetModule: reflection.sourceModule
      });
    }
  }

  if (plans.length) {
    await fs.mkdir(join(process.cwd(), 'logs'), { recursive: true });
    const logEntries = plans.map(p => JSON.stringify(removeCircular(p)) + '\n');
    await fs.appendFile(logPath, logEntries.join(''), 'utf-8');

    // Return the highest priority plan
    const highestPriority = plans.reduce((a, b) => (a.urgency || 0) > (b.urgency || 0) ? a : b);
    return highestPriority;
  }

  return {
    action: 'NONE',
    reason: 'No urgent improvements needed'
  };
}

function calculateUrgency(symbol: string, symbols: Record<string, any>): number {
  const entry = symbols[symbol];
  if (!entry) return 0;
  return Math.min(1, entry.frequency / 10);
}

export async function processInput(input: AgentInput, state: AgentState): Promise<AgentResult> {
  // Process the input and return a result
  return {
    confidence: 0.8,
    summary: 'Processed input successfully',
    timestamp: new Date().toISOString(),
    metadata: {
      inputSize: input.content?.length || 0
    }
  };
}

export function evolveImprovements(
  currentImprovements: ImprovementCandidate[],
  newReflections: ImprovementCandidate[]
): ImprovementCandidate[] {
  const evolved: ImprovementCandidate[] = [];

  // Merge and evolve existing improvements
  for (const current of currentImprovements) {
    const related = newReflections.find(
      r => r.sourceModule === current.sourceModule && r.issue === current.issue
    );

    if (related) {
      evolved.push({
        sourceModule: current.sourceModule,
        issue: current.issue,
        proposedFix: related.proposedFix || current.proposedFix,
        triggerCount: current.triggerCount + 1,
        confidenceTrend: [...current.confidenceTrend, ...related.confidenceTrend]
      });
    } else {
      evolved.push(current);
    }
  }

  // Add new improvements
  for (const reflection of newReflections) {
    const exists = evolved.some(
      e => e.sourceModule === reflection.sourceModule && e.issue === reflection.issue
    );

    if (!exists) {
      evolved.push({
        sourceModule: reflection.sourceModule,
        issue: reflection.issue,
        proposedFix: reflection.proposedFix,
        triggerCount: reflection.triggerCount,
        confidenceTrend: reflection.confidenceTrend
      });
    }
  }

  return evolved;
} 