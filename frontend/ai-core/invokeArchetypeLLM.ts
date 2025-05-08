import { AgentState } from '@/system/agentState';
import { formatSymbolicPrompt } from './symbolicFrame';
import { invokeLLM, LLMResponse } from './invokeLLM';
import { writeLLMInvocation } from '../journal/invocations/writeLLMInvocation';

/**
 * Invokes an LLM with an archetype-aligned prompt, using the unified multi-provider interface.
 * Routes through invokeLLM for provider selection and execution.
 * Persists responses to the invocation journal for historical analysis.
 */
export async function invokeArchetypeLLM(agentState: AgentState): Promise<LLMResponse> {
  // Format the prompt using symbolic state
  const prompt = formatSymbolicPrompt(agentState);

  // Log the invocation context
  console.log('[invokeArchetypeLLM] Context:', {
    archetype: prompt.symbolicState.activeArchetype,
    entropy: prompt.symbolicState.entropy,
    trustDrift: prompt.symbolicState.trustDriftScore
  });

  // Invoke the LLM through the unified interface
  const response = await invokeLLM(prompt);

  // Log the response details
  console.log(`[${response.provider}] Archetype Response:`, {
    text: response.text,
    confidence: response.metadata?.confidence,
    provider: response.provider
  });

  // Persist invocation result for reflection history
  await writeLLMInvocation(response);

  return response;
}

// Re-export types for convenience
export type { LLMResponse } from './invokeLLM'; 