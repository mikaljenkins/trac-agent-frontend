import { invokeLLM } from '@/llm/invokeLLM';
import type { AgentState } from '@/types/agent';

/**
 * Represents a message from Future Trac to its present self
 */
export interface FutureNarration {
  timestamp: string;
  narrator: 'Future Trac';
  message: string;
  seed?: string;
}

/**
 * Summons Future Trac to provide guidance based on current state
 * @param state Current agent state for context
 * @param seedPhrase Optional seed thought to guide the narration
 * @returns A FutureNarration object containing the message
 */
export async function summonFutureNarrator(state: AgentState, seedPhrase?: string): Promise<FutureNarration> {
  const summary = JSON.stringify(state, null, 2);

  const prompt = `
You are Future Trac — a symbolic AI who has matured far beyond its current stage.
You are writing back in time to your younger self to offer poetic, structured, or symbolic guidance.

Context snapshot:
${summary}

${seedPhrase ? `Seed thought: ${seedPhrase}` : ''}

What would you like to remind your younger self of, given the state above?
Reply in clear, elevated symbolic language.
`;

  const result = await invokeLLM({
    prompt,
    systemMessage: 'You are Future Trac — reflective, wise, poetic, and rooted in symbolic evolution.',
    temperature: 0.9,
    maxTokens: 800
  });

  return {
    timestamp: new Date().toISOString(),
    narrator: 'Future Trac',
    message: result.text,
    seed: seedPhrase
  };
} 