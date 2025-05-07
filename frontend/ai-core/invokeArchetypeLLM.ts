import { AgentState } from '@/system/agentState';
import { generatePromptForArchetype } from './archetypes/archetypeRouter';
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
  const prompt = generatePromptForArchetype(agentState, archetype);

  const response = await callLLM(prompt);

  // Log the invocation payload (for future journaling)
  console.log('[invokeArchetypeLLM] Invoked with:', { archetype, prompt });

  return {
    archetypeUsed: archetype,
    prompt,
    response,
    timestamp: new Date().toISOString(),
  };
} 