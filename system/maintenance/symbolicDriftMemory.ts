/**
 * 📘 SYMBOLIC DRIFT MEMORY
 * Logs snapshots of symbolic documents for version-based reflection.
 */

import { createHash } from 'crypto';
import fs from 'fs/promises';
import { logEvent } from '../core/loopMonitor';

export async function captureDriftSnapshot(label = 'readme-check') {
  const files = [
    'README.md',
    'docs/ai/architecture-overview.md',
    'docs/ai/symbolic-module-map.md'
  ];

  const timestamp = new Date().toISOString();
  const snapshots: Record<string, { content: string; hash: string } | string> = {};

  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const hash = createHash('sha256').update(content).digest('hex');
      snapshots[file] = { content, hash };
    } catch {
      snapshots[file] = '[Missing or unreadable]';
    }
  }

  // ✅ Ensure logs directory exists
  await fs.mkdir('logs', { recursive: true });

  // 📥 Append snapshot entry
  await fs.appendFile(
    'logs/symbolic-drift.jsonl',
    JSON.stringify({ timestamp, label, snapshots }) + '\n'
  );

  // 🧠 Log the snapshot action
  logEvent({
    timestamp,
    handler: 'captureDriftSnapshot',
    result: {
      summary: `Drift snapshot captured for: ${Object.keys(snapshots).join(', ')}`,
      symbolicTag: 'maintenance::symbolic-drift'
    },
    metadata: { domain: 'documentation', files: Object.keys(snapshots) }
  });

  return true;
} 