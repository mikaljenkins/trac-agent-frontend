import { invokeLLM } from '@/llm/invokeLLM';
import type { AgentState } from '@/types/agent';
import type { ImprovementCandidate } from '@/types/symbolic';
import type { ProcessedThought } from './thoughtStream';

export interface Reflection {
  source: ProcessedThought;
  summary: string;
  keyInsights: string[];
  recommendations: Array<{
    action: string;
    priority: number;
    rationale: string;
  }>;
  confidence: number;
  timestamp: string;
  threadContext?: Array<{
    input: string;
    reflection: any;
  }>;
}

export interface SelfReflection {
  insight: string;
  suggestion: string;
  priority: number; // 0 to 1
}

/**
 * Analyzes the agent's state for potential improvements
 */
export function selfReflect(agentState: AgentState): ImprovementCandidate[] {
  const improvements: ImprovementCandidate[] = [];
  const recentInput = agentState.lastInput?.content || 'No input yet';
  const recentResult = agentState.lastResult?.summary || 'No result yet';

  // Input complexity analysis
  if (recentInput.length > 200) {
    improvements.push({
      sourceModule: 'inputProcessor',
      issue: 'Recent input was lengthy, possibly indicating overwhelm or urgency.',
      proposedFix: 'Introduce an input summarizer to streamline context.',
      triggerCount: 1,
      confidenceTrend: [0.85]
    });
  }

  // Trust pattern detection
  if (recentResult.includes('trust')) {
    improvements.push({
      sourceModule: 'trustAnalyzer',
      issue: 'The system is heavily focusing on trust mechanics.',
      proposedFix: 'Implement a trust feedback visualizer or tracker.',
      triggerCount: 1,
      confidenceTrend: [0.9]
    });
  }

  // Interaction pattern analysis
  if (agentState.sessionThread.length > 5) {
    const recentInteractions = agentState.sessionThread.slice(-5);
    const avgConfidence = recentInteractions.reduce((acc, curr) => 
      acc + (curr.reflection?.confidence || 0), 0) / recentInteractions.length;

    if (avgConfidence < 0.7) {
      improvements.push({
        sourceModule: 'contextManager',
        issue: 'Recent interactions show declining confidence levels.',
        proposedFix: 'Enhance context retention and pattern recognition mechanisms.',
        triggerCount: 1,
        confidenceTrend: [avgConfidence]
      });
    }
  }

  // Theme consistency check
  const uniqueThemes = new Set(
    agentState.sessionThread.flatMap(t => 
      t.reflection?.keyInsights?.map(i => i.toLowerCase()) || []
    )
  );

  if (uniqueThemes.size > 10) {
    improvements.push({
      sourceModule: 'themeAnalyzer',
      issue: 'Conversation themes are highly diverse, potential context scatter.',
      proposedFix: 'Implement theme clustering and relationship mapping.',
      triggerCount: 1,
      confidenceTrend: [0.75]
    });
  }

  // Update trigger counts and confidence trends for existing improvements
  return improvements.map(improvement => {
    const existing = agentState.pendingImprovements?.find(
      p => p.sourceModule === improvement.sourceModule && p.issue === improvement.issue
    );

    if (existing) {
      return {
        sourceModule: existing.sourceModule,
        issue: existing.issue,
        proposedFix: existing.proposedFix,
        triggerCount: existing.triggerCount + 1,
        confidenceTrend: [...existing.confidenceTrend, improvement.confidenceTrend[0]]
      };
    }

    return improvement;
  });
}

/**
 * Generates a reflection based on processed thoughts
 */
export async function reflect(
  thought: ProcessedThought,
  thread?: Array<{ input: string; reflection: any }>
): Promise<Reflection> {
  const result = await invokeLLM({
    prompt: 'Generate reflection and recommendations',
    systemMessage: 'You are a reflection system generating insights and recommendations.',
    context: {
      currentThought: thought,
      conversationHistory: thread?.map(t => ({
        input: t.input,
        reflection: t.reflection.summary
      }))
    }
  });

  // For now return mock reflection data with thread awareness
  const threadAwareInsight = thread?.length 
    ? 'Maintaining conversational context and building on previous interactions'
    : 'Initial interaction establishing baseline patterns';

  return {
    source: thought,
    summary: `Strong emergence of trust-based learning patterns with increasing symbolic coherence. ${threadAwareInsight}`,
    keyInsights: [
      'Trust and learning systems showing strong alignment',
      'Pattern recognition capabilities improving',
      'Symbolic processing becoming more coherent',
      ...(thread?.length ? ['Conversation history enriching context understanding'] : [])
    ],
    recommendations: [
      {
        action: 'Enhance trust validation mechanisms',
        priority: 0.9,
        rationale: 'Critical for maintaining system integrity'
      },
      {
        action: 'Expand pattern recognition domains',
        priority: 0.85,
        rationale: 'Supports improved learning capabilities'
      },
      ...(thread?.length ? [{
        action: 'Strengthen contextual memory integration',
        priority: 0.88,
        rationale: 'Enables more coherent conversation flow'
      }] : [])
    ],
    confidence: 0.88,
    timestamp: result.metadata?.timestamp || new Date().toISOString(),
    threadContext: thread
  };
} 