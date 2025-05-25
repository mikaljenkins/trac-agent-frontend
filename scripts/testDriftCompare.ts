#!/usr/bin/env tsx

/**
 * 🧪 Enhanced Symbolic Drift Comparator CLI
 *
 * Compares recent symbolic documentation snapshots with:
 * - Inline diffs for each changed file
 * - Timestamp filtering via CLI flags
 * - Audit logging for traceability
 * - Optional commentary for drift analysis
 */

import { diffLines } from 'diff';
import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import { logEvent } from '../system/core/loopMonitor';

type Snapshot = {
  timestamp: string;
  label: string;
  snapshots: Record<string, string>;
};

async function readSnapshots(): Promise<Snapshot[]> {
  const filePath = path.resolve('logs/symbolic-drift.jsonl');
  const content = await fs.readFile(filePath, 'utf-8');
  return content
    .split('\n')
    .filter(Boolean)
    .map(line => JSON.parse(line))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function printDiff(title: string, oldText: string, newText: string) {
  console.log(`\n📝 ${title}`);
  const diff = diffLines(oldText, newText);
  for (const part of diff) {
    const prefix = part.added ? '+' : part.removed ? '-' : ' ';
    const color = part.added ? '\x1b[32m' : part.removed ? '\x1b[31m' : '\x1b[90m';
    process.stdout.write(color + prefix + part.value + '\x1b[0m');
  }
}

function determineDriftTag(changedFiles: string[]): string {
  if (changedFiles.includes("README.md")) return "drift::readme";
  if (changedFiles.includes("docs/ai/architecture-overview.md")) return "drift::architecture";
  if (changedFiles.includes("docs/ai/symbolic-module-map.md")) return "drift::modules";
  return "drift::misc";
}

async function compareSnapshots(fromTime?: string, toTime?: string, comment?: string) {
  const snapshots = await readSnapshots();
  const filtered = snapshots.filter(snap => {
    const t = new Date(snap.timestamp).getTime();
    return (!fromTime || t >= new Date(fromTime).getTime()) &&
           (!toTime || t <= new Date(toTime).getTime());
  });

  if (filtered.length < 2) {
    console.log('❌ Not enough snapshots for comparison.');
    return;
  }

  const [latest, previous] = filtered;
  console.log(`\n📊 Comparing snapshots:\n• ${previous.timestamp}\n• ${latest.timestamp}`);

  const changedFiles: string[] = [];
  for (const file of Object.keys(latest.snapshots)) {
    const oldContent = previous.snapshots[file] || '';
    const newContent = latest.snapshots[file] || '';
    if (oldContent !== newContent) {
      changedFiles.push(file);
      printDiff(file, oldContent, newContent);
    }
  }

  // Log the comparison result
  await logEvent({
    timestamp: new Date().toISOString(),
    handler: 'testDriftCompare',
    trace: ['symbolic-drift.jsonl'],
    input: { fromTime, toTime },
    result: {
      summary: `Compared symbolic drift snapshots from ${fromTime || 'latest'} to ${toTime || 'latest'}`,
      symbolicTag: determineDriftTag(changedFiles),
      ...(comment && { commentary: comment })
    },
    metadata: { 
      domain: 'documentation',
      status: changedFiles.length > 0 ? 'changed' : 'stable',
      comparisonType: 'inline-diff',
      filesCompared: Object.keys(latest.snapshots),
      changedFiles
    }
  });
}

// CLI entry
const [,, ...args] = process.argv;
const fromFlag = args.indexOf('--from');
const toFlag = args.indexOf('--to');
const commentFlag = args.indexOf('--comment');

const fromTime = fromFlag !== -1 ? args[fromFlag + 1] : undefined;
const toTime = toFlag !== -1 ? args[toFlag + 1] : undefined;
const comment = commentFlag !== -1 ? args[commentFlag + 1] : undefined;

compareSnapshots(fromTime, toTime, comment).catch(err => {
  console.error('💥 Error during snapshot comparison:', err);
}); 