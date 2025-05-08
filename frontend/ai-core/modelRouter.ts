import { SymbolicLLMPrompt } from './symbolicFrame';

export type LLMProvider = 'ollama' | 'lmstudio' | 'openai';

export interface ModelRouteDecision {
  model: LLMProvider;
  reason: string;
  fallbackOptions?: LLMProvider[];
}

/**
 * Determines which LLM provider to use based on symbolic state and system configuration.
 * Considers:
 * - Environmental overrides (USE_LOCAL_ONLY, PREFERRED_MODEL)
 * - Symbolic entropy level
 * - Trust drift score
 * - Active archetype
 */
export function selectModel(prompt: SymbolicLLMPrompt): ModelRouteDecision {
  // Check for developer overrides
  if (process.env.USE_LOCAL_ONLY === 'true') {
    return {
      model: 'ollama',
      reason: 'Forced to local mode via USE_LOCAL_ONLY override',
      fallbackOptions: ['lmstudio']
    };
  }

  if (process.env.PREFERRED_MODEL as LLMProvider) {
    return {
      model: process.env.PREFERRED_MODEL as LLMProvider,
      reason: 'Using developer-specified preferred model',
      fallbackOptions: ['ollama', 'lmstudio']
    };
  }

  // Extract state metrics
  const entropy = prompt.symbolicState.entropy ?? 0;
  const trustDrift = prompt.symbolicState.trustDriftScore ?? 0;
  const archetype = prompt.symbolicState.activeArchetype;

  // Route based on symbolic complexity and trust state
  if (entropy > 0.7 || trustDrift > 0.5) {
    return {
      model: 'openai',
      reason: `High ${entropy > 0.7 ? 'entropy' : 'trust drift'} - using most capable model`,
      fallbackOptions: ['lmstudio', 'ollama']
    };
  }

  // Archetype-specific routing
  if (archetype === 'Oracle') {
    return {
      model: 'openai',
      reason: 'Oracle archetype prefers high-capability model',
      fallbackOptions: ['lmstudio']
    };
  }

  // Default to local model for standard operations
  return {
    model: 'lmstudio',
    reason: 'Default routing for moderate symbolic complexity',
    fallbackOptions: ['ollama', 'openai']
  };
}

/**
 * Validates if a given model is currently available.
 * TODO: Implement actual availability checking logic
 */
export function isModelAvailable(model: LLMProvider): boolean {
  // Stub - replace with real availability checks
  return true;
}

/**
 * Gets the next available model from the fallback chain.
 * Returns null if no models are available.
 */
export function getFallbackModel(
  currentModel: LLMProvider,
  fallbacks: LLMProvider[]
): LLMProvider | null {
  const availableFallbacks = fallbacks.filter(model => 
    model !== currentModel && isModelAvailable(model)
  );
  return availableFallbacks[0] ?? null;
} 