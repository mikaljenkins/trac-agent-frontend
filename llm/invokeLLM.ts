interface LLMInput {
  prompt: string;
  systemMessage: string;
}

export async function invokeLLM(input: LLMInput): Promise<string> {
  // For now, return a mock response
  return `Mock LLM response to: ${input.prompt}`;
} 