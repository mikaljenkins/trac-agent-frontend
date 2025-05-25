/**
 * 🔒 TAMPER MEMORY
 *
 * Immutable symbolic log of integrity breaches or symbolic interference.
 * DO NOT mutate past entries. This is a sealed symbolic ledger.
 */

import { logEvent } from '@/system/loopMonitor';
import { serializeTrace } from '@/system/utils/traceSerializer';
import type { AgentState } from '@/types/agent';
import type { TamperEvent } from '@/types/security';
import * as fs from 'fs/promises';
import * as path from 'path';
import { narrateIncident } from '../security/incidentNarrator';

export async function recordTamper(event: Omit<TamperEvent, 'timestamp' | 'locked'>) {
  const timestamp = new Date().toISOString();
  const entry: TamperEvent = {
    ...event,
    timestamp,
    locked: true
  };

  // Ensure logs directory exists
  const logDir = path.join(process.cwd(), 'logs');
  await fs.mkdir(logDir, { recursive: true });

  const logPath = path.join(logDir, 'tamper-memory.jsonl');
  await fs.appendFile(logPath, JSON.stringify(entry) + '\n');

  // Log the tamper event symbolically
  await logEvent({
    timestamp,
    input: { 
      content: `Tamper event recorded: ${event.module}`,
      timestamp
    },
    result: {
      summary: `Symbolic breach recorded in tamper memory`,
      confidence: 1.0,
      timestamp,
      metadata: {
        symbolicTag: 'security::tamper_recorded',
        vector: event.vector,
        module: event.module
      }
    },
    trace: serializeTrace(['security:tamper_recorded', entry]),
    stateSnapshot: {
      sessionThread: [],
      metadata: {
        startTime: timestamp,
        interactionCount: 0
      }
    } as AgentState
  });

  // Narrate the incident
  const narration = narrateIncident(entry);
  console.log('\n🔒 Security Incident Report:\n');
  console.log(narration);
}

export async function getTamperHistory(): Promise<TamperEvent[]> {
  const logPath = path.join(process.cwd(), 'logs', 'tamper-memory.jsonl');
  try {
    const content = await fs.readFile(logPath, 'utf-8');
    return content
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line));
  } catch {
    return [];
  }
} 