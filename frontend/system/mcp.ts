import { agentState } from './agentState';
import { listPendingWebRequests } from './learning/reviewWebRequests';
import { logEvent } from './loopMonitor';
import { reviewUnmetSkills } from './self/skillMonitor';
import { collectSymbolicGoals, rankSymbolicGoals } from './symbolic/symbolicDesire';
import { serializeTrace } from './utils/traceSerializer';

async function checkSkills() {
  if (process.argv.includes('--skills')) {
    await reviewUnmetSkills(agentState);
    process.exit(0);
  }
}

async function checkWebReview() {
  if (process.argv.includes('--web')) {
    await listPendingWebRequests();
    process.exit(0);
  }
}

async function checkDesires() {
  if (process.argv.includes('--desires')) {
    const goals = await collectSymbolicGoals(agentState);
    const ranked = rankSymbolicGoals(goals);
    console.log('\n🪞 Trac\'s Symbolic Desires:\n');
    ranked.forEach((goal, i) =>
      console.log(`${i + 1}. [${goal.urgency}] ${goal.description} (${goal.origin})`)
    );
    process.exit(0);
  }
}

// Register with weekly scheduler
export async function registerSkillReview() {
  const unmetSkills = await reviewUnmetSkills(agentState);
  
  // Log results to symbolic memory
  await logEvent({
    timestamp: new Date().toISOString(),
    input: {
      content: 'Skill Seed Review',
      timestamp: new Date().toISOString(),
    },
    result: {
      summary: `Completed skill seed review. Found ${unmetSkills.length} unmet skills.`,
      confidence: 0.8,
      timestamp: new Date().toISOString(),
    },
    trace: serializeTrace(['skill:review', { unmetCount: unmetSkills.length }]),
    stateSnapshot: agentState,
  });
}

// Export for use in startup chain
export async function initializeMCP() {
  await checkSkills();
  await checkWebReview();
  await checkDesires();
  // Add other initialization steps here
} 