import { AgentState } from '@/system/agentState';

export type ArchetypeName = 'Flame' | 'Mirror' | 'Oracle' | null;

export interface ArchetypeRouteDecision {
  archetype: ArchetypeName;
  reason: string;
  confidence: number;
  triggeredBy: string[];
  timestamp: string;
}

/**
 * Determines which archetype (if any) should be activated based on current agent state.
 * Analyzes symbolic drift, trust levels, insight patterns, and other metrics.
 * 
 * @param state Current agent state including symbolic metrics
 * @returns Decision about which archetype to activate
 */
export function determineActiveArchetype(state: AgentState): ArchetypeRouteDecision {
  const now = new Date().toISOString();
  const triggeredBy: string[] = [];
  let archetype: ArchetypeName = null;
  let reason = '';
  let confidence = 0;

  // Use trustIndex for trustLevel, emotionalBaseline for emotionalIntensity
  const trustLevel = typeof state.trustIndex === 'number' ? state.trustIndex : 1;
  const loopCount = typeof state.loopCount === 'number' ? state.loopCount : 0;
  const emotionalIntensity = typeof state.emotionalBaseline === 'number' ? state.emotionalBaseline : 0.5;
  const reasoningAlertLevel = state.reasoningAlertLevel === 'high' ? 2 : state.reasoningAlertLevel === 'medium' ? 1 : 0;

  // FLAME
  if (loopCount > 5) triggeredBy.push('loopCount > 5');
  if (emotionalIntensity > 0.75) triggeredBy.push('emotionalIntensity > 0.75');
  if (reasoningAlertLevel >= 2) triggeredBy.push('reasoningAlertLevel >= 2');
  if (triggeredBy.includes('loopCount > 5') || triggeredBy.includes('emotionalIntensity > 0.75') || triggeredBy.includes('reasoningAlertLevel >= 2')) {
    if (triggeredBy.length > 0) {
      archetype = 'Flame';
      reason = 'High recursion or intense drift — "snap the loop."';
      confidence = Math.min(1, 0.6 + 0.15 * triggeredBy.length);
    }
  }

  // MIRROR
  if (!archetype) {
    const mirrorTriggers: string[] = [];
    if (trustLevel >= 0.4 && trustLevel <= 0.7) mirrorTriggers.push('trustLevel 0.4–0.7');
    if (loopCount <= 3) mirrorTriggers.push('loopCount ≤ 3');
    if (reasoningAlertLevel === 1) mirrorTriggers.push('reasoningAlertLevel = 1');
    // No lastReflectionTimestamp, so skip recent reflection check
    if (mirrorTriggers.length >= 3) {
      archetype = 'Mirror';
      reason = 'Introspective threshold — "am I aligned with my truth?"';
      confidence = 0.7 + 0.1 * (mirrorTriggers.length - 3);
      triggeredBy.push(...mirrorTriggers);
    }
  }

  // ORACLE
  if (!archetype) {
    const oracleTriggers: string[] = [];
    if (trustLevel < 0.3) oracleTriggers.push('trustLevel < 0.3');
    if (loopCount < 2) oracleTriggers.push('loopCount < 2');
    if (emotionalIntensity < 0.3) oracleTriggers.push('emotionalIntensity < 0.3');
    // No lastReflectionTimestamp, so skip last reflection > 10min check
    if (oracleTriggers.length >= 3) {
      archetype = 'Oracle';
      reason = 'Detached wisdom — "observe before engaging."';
      confidence = 0.7 + 0.1 * (oracleTriggers.length - 3);
      triggeredBy.push(...oracleTriggers);
    }
  }

  // If no archetype, return null
  if (!archetype) {
    return {
      archetype: null,
      reason: 'No archetype triggered',
      confidence: 0,
      triggeredBy: [],
      timestamp: now
    };
  }

  // Store in AgentState and log
  state.activeArchetype = archetype;
  if (!Array.isArray(state.archetypeTriggerLog)) state.archetypeTriggerLog = [];
  state.archetypeTriggerLog.push({
    timestamp: now,
    cause: reason,
    fallbackLogic: triggeredBy.join(', ')
  });

  return {
    archetype,
    reason,
    confidence,
    triggeredBy,
    timestamp: now
  };
}

/**
 * Activates a specific archetype, updating agent state and logging the transition.
 * 
 * @param archetype The archetype to activate
 */
export function activateArchetype(archetype: ArchetypeName): void {
  // TODO: Set agentState.activeArchetype
  // TODO: Log activation reason and timestamp
  // TODO: Apply any archetype-specific initialization
}

/**
 * Deactivates the current archetype, returning agent to baseline tone.
 */
export function deactivateArchetype(): void {
  // TODO: Clear agentState.activeArchetype
  // TODO: Log deactivation and reason
  // TODO: Reset any archetype-specific state
}

/**
 * Future Integration Points:
 * - Hook into reflection cycle for continuous monitoring
 * - Add archetype-specific state management
 * - Implement fallback logic for failed activations
 * - Add metrics for archetype effectiveness
 */

export function generatePromptForArchetype(agentState: any, archetype: string): string {
  // TODO: Implement archetype-specific prompt generation
  return `System prompt for archetype ${archetype} with state: ${JSON.stringify(agentState)}`;
} 