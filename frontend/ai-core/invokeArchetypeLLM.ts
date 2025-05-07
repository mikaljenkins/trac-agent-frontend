import { AgentState } from '@/system/agentState';
import { generatePromptForArchetype } from './archetypes/archetypeRouter';

function useLLMInvocation(): boolean {
  return process.env.USE_LLM_INVOCATION === 'true';
}

// Stub for callLLM if not implemented
// import { callLLM } from '@/lib/llm/callLLM';
async function callLLM(prompt: string): Promise<string> {
  // TODO: Replace with real LLM call
  return `LLM response to: ${prompt}`;
}

export interface LLMInvocationResult {
  archetypeUsed: string;
  prompt: string;
  response: string;
  timestamp: string;
}

export async function invokeArchetypeLLM(agentState: AgentState): Promise<LLMInvocationResult> {
  const archetype = agentState.activeArchetype ?? agentState.predictedArchetype ?? 'Flame';
  // Add entropy to prompt context if available
  const entropy = agentState.lastSymbolicHealth?.entropy ?? null;
  let prompt = generatePromptForArchetype(agentState, archetype);
  if (entropy !== null) {
    prompt += `\n[Symbolic Entropy: ${entropy}]`;
  }

  let response: string;
  if (useLLMInvocation()) {
    // TODO: Replace with real LLM call
    response = await callLLM(prompt);
  } else {
    response = `LLM (stubbed) response to: ${prompt}`;
  }

  // Log the invocation payload (for future journaling)
  console.log('[invokeArchetypeLLM] Invoked with:', { archetype, prompt });

  return {
    archetypeUsed: archetype,
    prompt,
    response,
    timestamp: new Date().toISOString(),
  };
}

export { useLLMInvocation }; 