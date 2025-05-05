// Analyzes mutation logs to extract valuable insights
// Identifies successful patterns and strategies

import fs from 'fs/promises';
import path from 'path';
import { SimulationRun } from './simulationRun';
import { getLogFilePath } from './logPathManager';

export interface Wisdom {
  pattern: string;
  impact: number;
  frequency: number;
  examples: any[];
}

export const harvestWisdom = async (): Promise<Wisdom[]> => {
  const logPath = getLogFilePath();
  const logContent = await fs.readFile(logPath, 'utf-8');
  const runs: SimulationRun[] = JSON.parse(logContent);

  const patterns = new Map<string, {
    impact: number;
    count: number;
    examples: any[];
  }>();

  runs.forEach(run => {
    run.mutations.forEach(mutation => {
      const key = `${mutation.field}:${mutation.reason}`;
      const current = patterns.get(key) || { impact: 0, count: 0, examples: [] };
      
      patterns.set(key, {
        impact: current.impact + mutation.impact,
        count: current.count + 1,
        examples: [...current.examples, mutation].slice(-3) // Keep last 3 examples
      });
    });
  });

  return Array.from(patterns.entries()).map(([pattern, data]) => ({
    pattern,
    impact: data.impact / data.count,
    frequency: data.count,
    examples: data.examples
  })).sort((a, b) => b.impact - a.impact);
};

export const getHighValueMutations = async (threshold: number = 0.4): Promise<Wisdom[]> => {
  const wisdom = await harvestWisdom();
  return wisdom.filter(w => w.impact >= threshold);
}; 