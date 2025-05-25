/**
 * Interface for symbolic LLM prompts
 */
export interface SymbolicLLMPrompt {
  systemMessage: string;
  symbolicState: {
    activeArchetype: string;
    predictedArchetype?: string;
    trustDriftScore: number;
    entropy: number;
    memoryEcho?: string[];
  };
  entropyNote: string;
}

/**
 * Wraps input in a symbolic frame for LLM processing
 * @param input The input string to frame
 * @returns The framed input
 */
export function symbolicFrame(input: string) {
  // Wraps input for LLM processing
  return { framed: input };
} 