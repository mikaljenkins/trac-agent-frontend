import { skillSeeds } from '@/system/learning/skillSeeds';
import { requestWebAccess } from '@/system/learning/webRequestIntent';
import { logEvent } from '@/system/loopMonitor';
import { serializeTrace } from '@/system/utils/traceSerializer';
import type { AgentState } from '@/types/agent';

export async function reviewUnmetSkills(agentState: AgentState): Promise<typeof skillSeeds> {
  const unmet = skillSeeds.filter((seed) => {
    const deps = seed.dependencies || [];
    return deps.some((dep) => !isDependencyMet(agentState, dep));
  });

  for (const seed of unmet) {
    const missing = (seed.dependencies || []).filter(
      (dep) => !isDependencyMet(agentState, dep)
    );

    await logEvent({
      timestamp: new Date().toISOString(),
      input: {
        content: `Skill Seed Check: ${seed.name}`,
        timestamp: new Date().toISOString(),
      },
      result: {
        summary: `Skill seed '${seed.name}' is not yet active. Missing dependencies: ${missing.join(', ')}`,
        confidence: 0.75,
        timestamp: new Date().toISOString(),
      },
      trace: serializeTrace(['skillMonitor:seed-check', { seed: seed.name, missing }]),
      stateSnapshot: agentState,
    });

    if (!agentState.pendingImprovements) {
      agentState.pendingImprovements = [];
    }
    agentState.pendingImprovements.push({
      sourceModule: 'skillMonitor',
      issue: `Skill unmet: ${seed.name}`,
      proposedFix: `Implement seed: ${seed.purpose}`,
      triggerCount: 1,
      confidenceTrend: [0.5]
    });

    if (seed.dependencies?.includes('webResearch')) {
      await proposeInternetSearch(
        agentState,
        `Research needed for skill development: ${seed.name}`,
        `Skill seed requires web research to understand: ${seed.purpose}`
      );
    }
  }

  return unmet;
}

/**
 * Proposes an internet search to resolve a symbolic or skill-related question
 */
export async function proposeInternetSearch(
  agentState: AgentState,
  reason: string,
  symbolContext: string
): Promise<void> {
  const urgency = reason.toLowerCase().includes('critical') ? 'high' : 'medium';
  
  await requestWebAccess({
    reason,
    hypothesis: `Web research may help resolve: ${symbolContext}`,
    urgency
  });

  await logEvent({
    timestamp: new Date().toISOString(),
    input: {
      content: `Web Access Request: ${reason}`,
      timestamp: new Date().toISOString(),
    },
    result: {
      summary: `Requested web access to resolve: ${symbolContext}`,
      confidence: 0.7,
      timestamp: new Date().toISOString(),
    },
    trace: serializeTrace(['skillMonitor:web-request', { reason, symbolContext }]),
    stateSnapshot: agentState,
  });
}

function isDependencyMet(agentState: AgentState, dep: string): boolean {
  if (dep === 'symbolMap') {
    return agentState.sessionThread.some((e) =>
      e.result?.summary?.toLowerCase().includes('symbol')
    );
  }
  if (dep === 'loopReflection') {
    return agentState.metadata.interactionCount >= 5;
  }
  if (dep === 'forecastSystem') {
    return agentState.sessionThread.some((e) =>
      e.result?.summary?.toLowerCase().includes('forecast')
    );
  }
  if (dep === 'webResearch') {
    return false; // Always requires web access
  }
  return false; // fallback for unhandled dependencies
} 