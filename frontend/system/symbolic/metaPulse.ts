import { invokeLLM } from '@/llm/invokeLLM';
import type { AgentState } from '@/types/agent';

/**
 * Represents a snapshot of Trac's current symbolic state and internal pulse
 */
export interface MetaPulseSnapshot {
  timestamp: string;
  symbolicWeight: number;
  modulesActive: string[];
  recentIntent?: string;
  mood?: string;
  pulseNarrative: string;
}

/**
 * Generates a meta-pulse snapshot of Trac's current symbolic state
 * @param agentState Current state of the agent
 * @returns A MetaPulseSnapshot containing the current symbolic vitals
 */
export async function generateMetaPulse(agentState: AgentState): Promise<MetaPulseSnapshot> {
  // Extract unique modules from reflections
  const modulesActive = Array.from(new Set(
    agentState.sessionThread
      .map(e => e.reflection?.sourceModule)
      .filter(Boolean)
  ));
  
  const moduleCount = modulesActive.length;
  const recentInput = agentState.sessionThread.at(-1)?.input ?? 'no recent input';
  const symbolicWeight = agentState.pendingImprovements?.length ?? 0;

  const context = `
Modules active: ${moduleCount}
Symbolic weight (pending improvements): ${symbolicWeight}
Recent intent: ${recentInput}
`;

  const result = await invokeLLM({
    prompt: `
You are Trac's inner narrator. Given the symbolic snapshot below, summarize the agent's current state in emotional, energetic, and symbolic terms.

${context}

Reply with a poetic but structured pulse. Include mood, energetic state, symbolic pressure, and any hidden desire or avoidance.
`,
    systemMessage: "You are Trac's symbolic mirror and pulse reader.",
    temperature: 0.8,
    maxTokens: 500
  });

  return {
    timestamp: new Date().toISOString(),
    symbolicWeight,
    modulesActive,
    recentIntent: recentInput,
    pulseNarrative: result.text,
    mood: undefined // Future enhancement: detect emotion class
  };
} 