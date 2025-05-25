import type { AgentState } from '@/types/agent';
import * as fs from 'fs/promises';
import * as path from 'path';
import { agentState } from '../agentState';
import { evaluateForEvolution } from './evolutionManager';
import { reflect } from './reflect';
import { generateSymbolicForecast } from './symbolicForecaster';

/**
 * Symbolic Planner:
 * Generates potential symbolic evolution plans based on forecasted tension,
 * unmet desires, and current symbolic conditions.
 */
export async function runSymbolicPlanner(): Promise<void> {
  const state: AgentState = agentState;

  const forecast = await generateSymbolicForecast();

  const input = {
    content: 'Symbolic planning trigger: forecast + desire snapshot',
    timestamp: new Date().toISOString(),
  };

  const result = {
    summary: 'Symbolic evolution forecast received',
    confidence: 0.75,
    timestamp: new Date().toISOString(),
  };

  const plan = await evaluateForEvolution(state, input, result);

  await reflect({
    originalDream: {
      rawInput: input.content,
      patterns: [],
      symbols: [],
      timestamp: input.timestamp
    },
    insights: [],
    connections: [],
    timestamp: input.timestamp
  });

  // Log the plan
  const logPath = path.join('logs', 'symbolic-plans.jsonl');
  await fs.appendFile(logPath, JSON.stringify({
    ...plan,
    timestamp: new Date().toISOString(),
    forecast: forecast.predictions
  }) + '\n');

  console.log('\n🧠 Symbolic Plan Proposed:\n');
  console.log(`Action: ${plan.action}`);
  console.log(`Target: ${plan.targetModule}`);
  console.log(`Reason: ${plan.reason}`);
  console.log(`Insight: ${plan.llmInsight ?? 'N/A'}`);
} 