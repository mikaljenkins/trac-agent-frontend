import * as fs from 'fs/promises';
import { join } from 'path';

interface EvolutionPlan {
  module: string;
  issue: string;
  proposedFix: string;
  urgencyScore: number;
  approved?: boolean;
  timestamp: string;
}

const logPath = join(process.cwd(), 'logs', 'evolution-plans.jsonl');

async function loadPlans(): Promise<EvolutionPlan[]> {
  try {
    const raw = await fs.readFile(logPath, 'utf-8');
    return raw.trim().split('\n').map(line => JSON.parse(line));
  } catch {
    return [];
  }
}

async function displayUnapprovedPlans(plans: EvolutionPlan[]) {
  const pending = plans.filter(p => !p.approved);
  if (pending.length === 0) {
    console.log('✅ No unapproved evolution plans.\n');
    return;
  }

  console.log('\n🔎 Pending Evolution Plans:\n');
  pending.forEach((plan, idx) => {
    console.log(`[${idx + 1}] Module: ${plan.module}`);
    console.log(`    Issue: ${plan.issue}`);
    console.log(`    Fix: ${plan.proposedFix}`);
    console.log(`    Urgency: ${plan.urgencyScore.toFixed(2)}\n`);
  });
}

async function markApproved(indexes: number[]) {
  const plans = await loadPlans();
  indexes.forEach(i => {
    if (plans[i]) plans[i].approved = true;
  });
  const rewritten = plans.map(p => JSON.stringify(p)).join('\n');
  await fs.writeFile(logPath, rewritten, 'utf-8');
  console.log(`\n✅ Marked ${indexes.length} plans as approved.`);
}

if (process.argv.includes('--review')) {
  loadPlans().then(displayUnapprovedPlans);
}

if (process.argv.includes('--approve')) {
  const idx = process.argv.indexOf('--approve');
  const args = process.argv.slice(idx + 1).map(Number);
  markApproved(args.map(i => i - 1)); // adjust for 0-based index
} 