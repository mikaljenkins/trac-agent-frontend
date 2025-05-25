import * as fs from 'fs/promises';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import type { LoopEvent } from '../../types/agent';

/**
 * Removes circular references from an object for safe JSON stringification
 */
function removeCircular(obj: any, seen = new WeakSet()): any {
  // Handle null and non-objects
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle circular reference
  if (seen.has(obj)) {
    return '[Circular]';
  }

  // Add object to seen set
  seen.add(obj);

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => removeCircular(item, seen));
  }

  // Handle objects
  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = removeCircular(obj[key], seen);
    }
  }
  return result;
}

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
  const safeEvent = removeCircular(event);

  const logPath = join(process.cwd(), 'logs', 'agent-memory.json');
  const logEntry = {
    traceId,
    timestamp: new Date().toISOString(),
    event: safeEvent
  };

  try {
    // Ensure logs directory exists
    await mkdir(join(process.cwd(), 'logs'), { recursive: true });

    // Read existing logs or create new array
    let logs: any[] = [];
    try {
      const existing = await fs.readFile(logPath, 'utf-8');
      logs = JSON.parse(existing);
    } catch (err) {
      // File doesn't exist or is invalid JSON, start with empty array
    }

    // Add new log entry and write back
    logs.push(logEntry);
    await fs.writeFile(logPath, JSON.stringify(logs, null, 2), 'utf-8');

    return traceId;
  } catch (err) {
    console.error('Failed to write event log:', err);
    throw err; // Re-throw to allow caller to handle the error
  }
} 

/**
 * Checks if a week has passed since the last run
 */
export function weeklyTrigger(lastRunISO: string): boolean {
  const last = new Date(lastRunISO);
  const now = new Date();
  const diff = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 7;
}