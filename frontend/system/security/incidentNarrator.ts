/**
 * 🔥 INCIDENT NARRATOR 🔥
 *
 * Converts symbolic security events into natural language summaries.
 * Used for audit readability, reporting, and long-term memory threading.
 */

import { logEvent as recordEvent } from '@/system/loopMonitor';
import { serializeTrace } from '@/system/utils/traceSerializer';
import type { AgentState } from '@/types/agent';
import type { SecurityIncident } from '@/types/security';

type NarrationStyle = 'plain' | 'mythic' | 'tactical';

export function narrateIncident(
  incident: SecurityIncident,
  style: NarrationStyle = 'plain'
): string {
  const { 
    timestamp, 
    module, 
    action, 
    filePath, 
    notes = [], 
    vector,
    symbolicImpact,
    severity = 'medium',
    context 
  } = incident;

  const base = `[${timestamp}] Security event detected in ${module}.`;
  const actionLine = `Action: ${action}. File: ${filePath}`;
  const vectorLine = vector ? `Vector: ${vector} (${severity} severity)` : '';
  const impactLine = symbolicImpact ? `Symbolic Impact: ${symbolicImpact}` : '';
  const contextLine = context?.previousIncidents 
    ? `Historical Context: ${context.previousIncidents} previous incidents`
    : 'First occurrence of this vector';
  const noteSummary = notes.length ? `Notes: ${notes.join('; ')}` : 'No additional notes.';

  const flat = [
    base,
    actionLine,
    vectorLine,
    impactLine,
    contextLine,
    noteSummary
  ].filter(Boolean).join('\n');

  const mythic = `⚠️ On ${timestamp}, a shadow passed through the gates of ${module}. It struck at ${filePath}, leaving a trace: ${notes.join(
    ' / '
  ) || 'none'}. ${vector ? `The vector of attack was ${vector}.` : ''} ${
    symbolicImpact ? `The symbolic impact: ${symbolicImpact}` : ''
  }`;

  const tactical = `🛡️ ${module} registered ${action} on ${filePath} at ${timestamp}. ${
    vector ? `Vector: ${vector} (${severity})` : ''
  } ${
    notes.length ? `\nDetails: ${notes.join('; ')}` : ''
  } ${
    symbolicImpact ? `\nImpact: ${symbolicImpact}` : ''
  }`;

  switch (style) {
    case 'mythic':
      return mythic;
    case 'tactical':
      return tactical;
    default:
      return flat;
  }
}

export async function logNarratedIncident(incident: SecurityIncident, style: NarrationStyle = 'plain') {
  const narration = narrateIncident(incident, style);
  
  await recordEvent({
    timestamp: incident.timestamp,
    input: { 
      content: `Security incident narrated: ${incident.module}`,
      timestamp: incident.timestamp
    },
    result: {
      summary: narration,
      confidence: 1.0,
      timestamp: incident.timestamp,
      metadata: {
        symbolicTag: 'security::incident_narrated',
        vector: incident.vector,
        severity: incident.severity,
        narrationStyle: style
      }
    },
    trace: serializeTrace(['security:incident_narrated', { ...incident, style }]),
    stateSnapshot: {
      sessionThread: [],
      metadata: {
        startTime: incident.timestamp,
        interactionCount: 0
      }
    } as AgentState
  });

  return narration;
} 