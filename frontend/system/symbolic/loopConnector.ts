import { proposeNewSkillSeedFromIntent } from '@/system/learning/selfModMemory';
import { evaluateForEvolution } from '@/system/symbolic/evolutionManager';
import { type AgentState } from '@/types/agent';
import * as fs from 'fs/promises';
import * as path from 'path';

const dreamLogPath = path.join('logs', 'dream-journal.jsonl');
const desireLogPath = path.join('logs', 'symbolic-desires.jsonl');
const planLogPath = path.join('logs', 'symbolic-plans.jsonl');

export async function runLoopConnector(agentState: AgentState) {
  const promises = [
    processDreams(agentState),
    processDesires(agentState),
    processPlans(agentState)
  ];

  await Promise.all(promises);
}

async function processDreams(agentState: AgentState) {
  try {
    const content = await fs.readFile(dreamLogPath, 'utf-8');
    const entries = content.trim().split('\n').map(line => JSON.parse(line));
    const latest = entries[entries.length - 1];

    if (latest?.dream) {
      await proposeNewSkillSeedFromIntent(
        `Symbolic insight from dream: ${latest.dream} [dreamDigestor]`
      );
    }
  } catch (err) {
    console.warn('No dream data to process.');
  }
}

async function processDesires(agentState: AgentState) {
  try {
    const content = await fs.readFile(desireLogPath, 'utf-8');
    const entries = content.trim().split('\n').map(line => JSON.parse(line));
    const top = entries.filter(e => e.urgency >= 0.8).slice(-1)[0];

    if (top?.message) {
      await proposeNewSkillSeedFromIntent(
        `Unmet symbolic desire: ${top.message} [desireLoop]`
      );
    }
  } catch (err) {
    console.warn('No desires to process.');
  }
}

async function processPlans(agentState: AgentState) {
  try {
    const content = await fs.readFile(planLogPath, 'utf-8');
    const entries = content.trim().split('\n').map(line => JSON.parse(line));
    const recent = entries.filter(e => e.predictions && e.predictions.length > 0).slice(-1)[0];

    if (recent?.predictions) {
      await evaluateForEvolution(agentState, {
        content: 'Symbolic plan predictions to review.',
        timestamp: new Date().toISOString()
      }, {
        summary: JSON.stringify(recent.predictions.slice(0, 2)),
        confidence: 0.6,
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn('No plans to evaluate.');
  }
} 