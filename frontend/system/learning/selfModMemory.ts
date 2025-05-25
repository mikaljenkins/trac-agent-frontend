import * as fs from 'fs/promises';
import * as path from 'path';
import type { SkillSeed } from './skillSeeds';

const logPath = path.resolve('logs/self-mod-intents.jsonl');

/**
 * Logs a symbolic rewiring intention as a seed for future evolution
 * @param reason The reason for the rewiring intent
 * @param relatedModules Array of module names affected by this rewiring
 */
export async function logRewiringIntent(reason: string, relatedModules: string[]) {
  const entry = {
    timestamp: new Date().toISOString(),
    reason,
    relatedModules,
    type: 'rewiring-intent'
  };

  try {
    await fs.mkdir(path.dirname(logPath), { recursive: true });
    await fs.appendFile(logPath, JSON.stringify(entry) + '\n');
    console.log(`🧠 Logged rewiring intent: ${reason}`);
  } catch (err) {
    console.error('Failed to log rewiring intent:', err);
  }
}

/**
 * Converts a rewiring intent into a new skill seed
 * @param reason The reason for the rewiring intent
 * @returns A new SkillSeed object
 */
export function proposeNewSkillSeedFromIntent(reason: string): SkillSeed {
  return {
    name: reason.slice(0, 48) + (reason.length > 48 ? '...' : ''),
    status: 'pending',
    purpose: reason,
    dependencies: [],
    notes: 'Self-directed reconfiguration'
  };
} 