/**
 * 📊 COMPARE SYMBOLIC DRIFT SNAPSHOTS
 *
 * Compares the two most recent entries in symbolic-drif.jsonl
 * and logs detected changes in README, architecture, and module map.
 */

import fs from 'fs/promises';
import { logEvent } from '../core/loopMonitor';

const DRIFT_LOG = 'logs/symbolic-drift.jsonl';

function getChangedFiles(before: any, after: any): string[] {
  const changes: string[] = [];
  for (const file of Object.keys(after.snapshots || {})) {
    if (before.snapshots?.[file] !== after.snapshots?.[file]) {
      changes.push(file);
    }
  }
  return changes;
}

export async function compareRecentDriftSnapshots() {
  try {
    const raw = await fs.readFile(DRIFT_LOG, 'utf-8');
    const lines = raw.trim().split('\n');
    if (lines.length < 2) return false;

    const before = JSON.parse(lines[lines.length - 2]);
    const after = JSON.parse(lines[lines.length - 1]);

    const changedFiles = getChangedFiles(before, after);

    if (changedFiles.length === 0) {
      await logEvent({
        timestamp: new Date().toISOString(),
        handler: 'compareRecentDriftSnapshots',
        result: {
          summary: 'No symbolic drift detected between latest snapshots.',
          symbolicTag: 'maintenance::drift-check::stable'
        },
        metadata: { domain: 'documentation', status: 'stable' }
      });
    } else {
      await logEvent({
        timestamp: new Date().toISOString(),
        handler: 'compareRecentDriftSnapshots',
        result: {
          summary: `Symbolic drift detected in: ${changedFiles.join(', ')}`,
          symbolicTag: 'maintenance::drift-check::delta'
        },
        metadata: { 
          domain: 'documentation', 
          status: 'changed',
          changed: changedFiles, 
          baseline: before.timestamp, 
          comparison: after.timestamp 
        }
      });
    }

    return true;
  } catch (err) {
    await logEvent({
      timestamp: new Date().toISOString(),
      handler: 'compareRecentDriftSnapshots',
      result: {
        summary: 'Drift comparison failed due to error',
        symbolicTag: 'maintenance::drift-check::error'
      },
      metadata: { 
        domain: 'documentation', 
        status: 'error',
        error: err.message || err.toString() 
      }
    });
    return false;
  }
} 