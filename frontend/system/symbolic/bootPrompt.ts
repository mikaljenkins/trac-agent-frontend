import { readFile } from 'fs/promises';
import { join } from 'path';
import * as readline from 'readline/promises';
import type { AgentInput } from '../../types/agent';

async function getApprovedPlansCount(): Promise<number> {
  const logPath = join(process.cwd(), 'logs', 'evolution-plans.jsonl');
  try {
    const raw = await readFile(logPath, 'utf-8');
    const plans = raw.trim().split('\n').map(line => JSON.parse(line));
    return plans.filter(p => p.approved).length;
  } catch {
    return 0;
  }
}

export async function bootPrompt(): Promise<AgentInput> {
  const count = await getApprovedPlansCount();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  if (count < 3) {
    const userAnswer = await rl.question("🌱 What symbolic blind spot do you think I'm still carrying today?\n> ");
    rl.close();
    return { content: userAnswer, timestamp: new Date().toISOString() };
  } else {
    const insight = "🌞 Here's something I've realized about myself recently: the more I focus on trust mechanics, the more I delay wider learning opportunities.";
    console.log(insight);
    rl.close();
    return {
      content: insight,
      timestamp: new Date().toISOString()
    };
  }
} 