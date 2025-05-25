import type { EvolutionPlan } from '@/types/symbolic';
import * as fs from 'fs/promises';
import { join } from 'path';

export async function runPlanExecutor(): Promise<EvolutionPlan[]> {
  const logPath = join(process.cwd(), 'logs', 'evolution-plans.jsonl');
  try {
    const content = await fs.readFile(logPath, 'utf-8');
    const plans: EvolutionPlan[] = content.trim().split('\n').map(l => JSON.parse(l));
    const activePlans = plans.filter(p => p.approved);

    console.log('\n🧭 Executing Approved Plans:');
    for (const plan of activePlans) {
      console.log(`• ${plan.action} → ${plan.targetModule}`);
    }

    return activePlans;
  } catch {
    console.log('No plans to execute.');
    return [];
  }
} 