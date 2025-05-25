import { removeCircular } from '@/lib/utils';
import { appendFile, mkdir } from 'fs/promises';
import { join } from 'path';
import type { LoopEvent } from '../../types/agent';

/**
 * Generates a unique trace ID for event tracking
 */
function generateTraceId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Logs an event to the agent's memory file with safe handling of circular references
 */
export async function logEvent(event: LoopEvent): Promise<string> {
  const traceId = generateTraceId();
  console.log('Loop event logged:', { traceId, ...event });

  const logPath = join(process.cwd(), 'logs', 'agent-memory.jsonl');
  const safeEntry = {
    traceId,
    logTime: new Date().toISOString(),
    input: removeCircular(event.input),
    result: removeCircular(event.result),
    trace: Array.isArray(event.trace) ? event.trace : [], // ← Add this safely
    stateSnapshot: removeCircular(event.stateSnapshot),
    timestamp: event.timestamp,
  };

  try {
    await mkdir(join(process.cwd(), 'logs'), { recursive: true });
    await appendFile(logPath, JSON.stringify(safeEntry) + '\n', 'utf-8');
    return traceId;
  } catch (err) {
    console.error('Failed to write event log:', err);
    throw err;
  }
}

/**
 * Weekly task trigger system for managing periodic tasks
 */
export const weeklyTrigger = {
  tasks: new Map<string, () => Promise<void>>(),
  
  register(name: string, task: () => Promise<void>) {
    this.tasks.set(name, task);
  },
  
  async runAll() {
    for (const [name, task] of this.tasks) {
      try {
        console.log(`\n🔄 Running weekly task: ${name}`);
        await task();
      } catch (err) {
        console.error(`Failed to run weekly task ${name}:`, err);
      }
    }
  }
}; 