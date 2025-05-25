import type { AgentInput, AgentResult, AgentState } from '../../../types/agent';

export interface EvolutionDecision {
  action: 'REWRITE_MODULE' | 'CALL_LLM' | 'FLAG_FOR_TRAINING' | 'NONE';
  reason: string;
  targetModule?: string;
  relatedData?: any;
}

const IMPROVEMENT_THRESHOLD = 3;
const CONFIDENCE_DROP_THRESHOLD = 0.2;

/**
 * Evaluates the current agent state and determines if evolutionary actions are needed
 */
export function evaluateForEvolution(
  state: AgentState,
  input: AgentInput,
  result: AgentResult
): EvolutionDecision {
  // Extract improvement suggestions from state
  const suggestions = state.pendingImprovements || [];

  // Find issues that have occurred multiple times
  const recurringIssues = suggestions.filter(
    (s) => s.triggerCount >= IMPROVEMENT_THRESHOLD
  );

  // Check for declining confidence trends
  const candidates = recurringIssues.filter((s) => {
    const trend = s.confidenceTrend;
    return (
      trend.length >= 2 &&
      trend[trend.length - 1] < trend[0] - CONFIDENCE_DROP_THRESHOLD
    );
  });

  // If we have candidates with declining confidence, trigger a module rewrite
  if (candidates.length > 0) {
    const mostUrgent = candidates[0];
    return {
      action: 'REWRITE_MODULE',
      reason: `Repeated low-confidence results in ${mostUrgent.sourceModule}`,
      targetModule: mostUrgent.sourceModule,
      relatedData: mostUrgent,
    };
  }

  // For very low confidence results, request LLM intervention
  if (result.confidence < 0.6) {
    return {
      action: 'CALL_LLM',
      reason: 'Low confidence detected — symbolic synthesis may be needed',
      relatedData: { input, result },
    };
  }

  // Check if interaction was flagged for training
  if (result.feedbackTag === 'needs-training') {
    return {
      action: 'FLAG_FOR_TRAINING',
      reason: 'Interaction manually flagged for training dataset',
      relatedData: { input, result },
    };
  }

  // Default case - no evolution needed
  return {
    action: 'NONE',
    reason: 'No evolution required at this time.',
  };
} 