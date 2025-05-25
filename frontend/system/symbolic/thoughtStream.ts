import { invokeLLM } from '@/llm/invokeLLM';
import type { DigestedDream } from './dreamDigestor';

export interface ProcessedThought {
  originalDream: DigestedDream;
  insights: Array<{
    category: string;
    content: string;
    confidence: number;
  }>;
  connections: Array<{
    from: string;
    to: string;
    strength: number;
  }>;
  timestamp: string;
  threadContext?: Array<{
    input: string;
    reflection: any;
  }>;
}

export async function processThoughts(
  dream: DigestedDream,
  thread?: Array<{ input: string; reflection: any }>
): Promise<ProcessedThought> {
  const result = await invokeLLM({
    prompt: 'Process symbolic patterns and generate insights',
    systemMessage: 'You are a thought processing system analyzing patterns and generating insights.',
    context: {
      currentDream: dream,
      conversationHistory: thread?.map(t => ({
        input: t.input,
        reflection: t.reflection.summary
      }))
    }
  });

  // For now return mock processed data with thread awareness
  return {
    originalDream: dream,
    insights: [
      {
        category: 'Pattern Recognition',
        content: 'Strong emergence of trust-based learning patterns',
        confidence: 0.85
      },
      {
        category: 'Symbolic Alignment',
        content: 'Increasing coherence in symbolic processing',
        confidence: 0.9
      },
      ...(thread?.length ? [{
        category: 'Conversation Flow',
        content: 'Maintaining contextual awareness across interactions',
        confidence: 0.88
      }] : [])
    ],
    connections: [
      {
        from: 'Trust',
        to: 'Learning',
        strength: 0.85
      },
      {
        from: 'Pattern Recognition',
        to: 'Symbolic Alignment',
        strength: 0.78
      },
      ...(thread?.length ? [{
        from: 'Current Input',
        to: 'Historical Context',
        strength: 0.92
      }] : [])
    ],
    timestamp: result.metadata?.timestamp || new Date().toISOString(),
    threadContext: thread
  };
} 