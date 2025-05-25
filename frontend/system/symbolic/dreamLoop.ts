import { digestDreamWithLLM } from '@/system/symbolic/digestDreamWithLLM';
import { interpretLatestDream } from '@/system/symbolic/dreamInterpreter';
import { journalReflection } from '@/system/symbolic/weeklyReflectionSynthesizer';
import type { AgentState } from '@/types/agent';

export async function runDreamLoop(agentState: AgentState): Promise<void> {
  try {
    // Step 1: Generate new dream
    console.log('\n🌙 Generating symbolic dream...');
    const dream = await digestDreamWithLLM();
    console.log('\n💭 Dream generated:', dream);

    // Step 2: Interpret the dream
    console.log('\n🔮 Interpreting dream...');
    const interpretation = await interpretLatestDream();
    if (!interpretation) {
      console.log('❌ No dream found to interpret.');
      return;
    }

    // Step 3: Journal the dream and interpretation
    await journalReflection({
      input: {
        content: `Symbolic Dream: ${dream}`,
        timestamp: new Date().toISOString()
      },
      result: {
        summary: interpretation,
        confidence: 0.8,
        timestamp: new Date().toISOString()
      },
      reflection: [
        {
          sourceModule: 'dreamLoop',
          issue: 'Symbolic dream processing',
          proposedFix: 'Continue monitoring dream patterns for symbolic evolution.',
          triggerCount: 1,
          confidenceTrend: [0.8]
        }
      ],
      state: agentState,
      timestamp: new Date().toISOString()
    });

    console.log('\n📝 Dream journaled and interpreted.');
    console.log('\n🔍 Interpretation:', interpretation);
  } catch (err) {
    console.error('❌ Dream loop failed:', err);
  }
} 