import { invokeLLM } from '@/llm/invokeLLM';

export interface DigestedDream {
  rawInput: string;
  patterns: string[];
  symbols: Array<{
    name: string;
    significance: number;
    associations: string[];
  }>;
  timestamp: string;
  threadContext?: Array<{
    input: string;
    reflection: any;
  }>;
}

export async function dreamDigestor(
  input: string,
  thread?: Array<{ input: string; reflection: any }>
): Promise<DigestedDream> {
  const result = await invokeLLM({
    prompt: `Process symbolic input: ${input}`,
    systemMessage: 'You are a dream processing system analyzing symbolic patterns and meanings.',
    context: thread ? {
      conversationHistory: thread.map(t => ({
        input: t.input,
        reflection: t.reflection.summary
      }))
    } : undefined
  });

  // For now return mock processed data with thread awareness
  return {
    rawInput: input,
    patterns: [
      'Trust emergence',
      'Pattern recognition',
      'Symbolic alignment',
      ...(thread?.length ? ['Conversation continuity'] : [])
    ],
    symbols: [
      {
        name: 'Trust',
        significance: 0.85,
        associations: ['alignment', 'growth', 'stability']
      },
      {
        name: 'Learning',
        significance: 0.9,
        associations: ['patterns', 'adaptation', 'insight']
      },
      ...(thread?.length ? [{
        name: 'Memory',
        significance: 0.88,
        associations: ['context', 'history', 'continuity']
      }] : [])
    ],
    timestamp: result.metadata?.timestamp || new Date().toISOString(),
    threadContext: thread
  };
} 