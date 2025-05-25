/**
 * 🔁 INCIDENT THREAD REHYDRATOR
 *
 * Loads past tamperMemory events and reconstructs a symbolic timeline.
 * Useful for pattern analysis, forensic review, or narrative replay.
 */

import { logEvent as recordEvent } from '@/system/loopMonitor';
import { serializeTrace } from '@/system/utils/traceSerializer';
import type { AgentState } from '@/types/agent';
import type { SecurityIncident } from '@/types/security';
import fs from 'fs/promises';
import path from 'path';

export async function rehydrateIncidentThread(): Promise<SecurityIncident[]> {
  const logPath = path.join('logs', 'tamper-memory.jsonl');
  try {
    const data = await fs.readFile(logPath, 'utf8');
    const incidents = data
      .trim()
      .split('\n')
      .map(line => JSON.parse(line)) as SecurityIncident[];

    // Log the rehydration event
    await recordEvent({
      timestamp: new Date().toISOString(),
      input: { 
        content: 'Security incident thread rehydration requested',
        timestamp: new Date().toISOString()
      },
      result: {
        summary: `Rehydrated ${incidents.length} security incidents`,
        confidence: 1.0,
        timestamp: new Date().toISOString(),
        metadata: {
          symbolicTag: 'security::thread_rehydrated',
          incidentCount: incidents.length
        }
      },
      trace: serializeTrace(['security:thread_rehydrated', { count: incidents.length }]),
      stateSnapshot: {
        sessionThread: [],
        metadata: {
          startTime: new Date().toISOString(),
          interactionCount: 0
        }
      } as AgentState
    });

    return incidents;
  } catch {
    return [];
  }
} 