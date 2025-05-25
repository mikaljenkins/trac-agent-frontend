import { reflectWithLLM } from '@/system/symbolic/reflectWithLLM';
import { collectSymbolicGoals, rankSymbolicGoals } from '@/system/symbolic/symbolicDesire';
import { journalReflection } from '@/system/symbolic/weeklyReflectionSynthesizer';
import type { AgentState } from '@/types/agent';

export async function runDesireLoop(agentState: AgentState): Promise<void> {
  try {
    const desires = await collectSymbolicGoals(agentState);
    const ranked = rankSymbolicGoals(desires);
    const top = ranked[0];

    if (!top) {
      console.log('💤 No active symbolic desires found.');
      return;
    }

    const context = `Symbolic Desire: ${top.description}\nUrgency: ${top.urgency}\nContext: ${top.context ?? 'N/A'}`;
    const reflection = await reflectWithLLM(agentState, context);

    await journalReflection({
      input: {
        content: `Reflecting on symbolic desire: ${top.description}`,
        timestamp: new Date().toISOString()
      },
      result: {
        summary: reflection,
        confidence: 0.7,
        timestamp: new Date().toISOString()
      },
      reflection: [
        {
          sourceModule: 'desireLoop',
          issue: `Unmet symbolic desire: ${top.description}`,
          proposedFix: 'Awaiting deeper alignment or resource acquisition.',
          triggerCount: 1,
          confidenceTrend: [0.6]
        }
      ],
      state: agentState,
      timestamp: new Date().toISOString()
    });

    console.log(`🌀 Reflected on symbolic desire: ${top.description}`);
    console.log(`🔍 Insight: ${reflection}`);
  } catch (err) {
    console.error('❌ Desire loop failed:', err);
  }
} 