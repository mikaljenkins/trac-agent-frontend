/**
 * ❗ SYMBOLIC SECURITY WATCHER ❗
 *
 * Monitors core symbolic files for unauthorized changes.
 * Emits logEvent on detected mutation.
 * Does NOT block or revert — forensic only.
 */

import { logEvent } from '@/system/loopMonitor';
import { serializeTrace } from '@/system/utils/traceSerializer';
import type { AgentState } from '@/types/agent';
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { analyzeThreat } from './threatAnalysis';

const WATCHED_FILES = [
  'frontend/system/symbolic/symbolicResonance.ts',
  'frontend/system/symbolic/metaPulse.ts',
  'frontend/system/agentState.ts',
  'frontend/system/symbolic/symbolicSystemAuditor.ts'
];

export async function startSecurityMonitor() {
  const watcher = chokidar.watch(WATCHED_FILES, {
    persistent: true,
    ignoreInitial: true,
    usePolling: true,
    interval: 3000
  });

  watcher.on('change', async (filePath) => {
    const timestamp = new Date().toISOString();
    const fileStats = await fs.promises.stat(filePath);
    
    // Log the change
    await logEvent({
      timestamp,
      input: { 
        content: `File changed: ${filePath}`,
        timestamp
      },
      result: {
        summary: 'Symbolic mutation detected',
        confidence: 0.95,
        timestamp,
        metadata: {
          fileSize: fileStats.size,
          lastModified: fileStats.mtime.toISOString(),
          symbolicTag: 'security::mutation_detected'
        }
      },
      trace: serializeTrace([
        'security:mutation',
        {
          file: path.basename(filePath),
          path: filePath,
          timestamp
        }
      ]),
      stateSnapshot: {
        sessionThread: [],
        metadata: {
          startTime: timestamp,
          interactionCount: 0
        }
      } as AgentState
    });

    // Analyze the threat
    const threatReport = await analyzeThreat(filePath);
    
    // Log the threat analysis
    await logEvent({
      timestamp,
      input: { 
        content: `Threat analysis for: ${filePath}`,
        timestamp
      },
      result: {
        summary: threatReport.symbolicCommentary,
        confidence: threatReport.suspicionLevel,
        timestamp,
        metadata: {
          symbolicTag: 'security::threat_assessed',
          vector: threatReport.vector,
          suspicionLevel: threatReport.suspicionLevel
        }
      },
      trace: serializeTrace(['security:threat_assessed', threatReport]),
      stateSnapshot: {
        sessionThread: [],
        metadata: {
          startTime: timestamp,
          interactionCount: 0
        }
      } as AgentState
    });

    console.warn(`[SECURITY MONITOR] Change detected: ${filePath}`);
    console.warn(`[SECURITY MONITOR] Threat level: ${threatReport.suspicionLevel}`);
    console.warn(`[SECURITY MONITOR] Analysis: ${threatReport.symbolicCommentary}`);
  });

  // Log initialization
  await logEvent({
    timestamp: new Date().toISOString(),
    input: { 
      content: 'Security monitor initialization',
      timestamp: new Date().toISOString()
    },
    result: {
      summary: 'Symbolic security watcher activated',
      confidence: 1.0,
      timestamp: new Date().toISOString(),
      metadata: {
        symbolicTag: 'security::initialized'
      }
    },
    trace: serializeTrace(['security:initialized', { watchedFiles: WATCHED_FILES }]),
    stateSnapshot: {
      sessionThread: [],
      metadata: {
        startTime: new Date().toISOString(),
        interactionCount: 0
      }
    } as AgentState
  });

  console.log('[🔒] Security monitor initialized.');
} 