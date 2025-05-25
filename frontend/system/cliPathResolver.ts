/**
 * ❗ SYMBOLIC CLI SAFETY DIRECTIVE ❗
 *
 * This system supports layered symbolic modules and CLI triggers.
 * Before executing any CLI flag:
 *
 *   ✅ Confirm the correct path to the CLI entry file (e.g., mcp.ts)
 *   ✅ Search across folders like: frontend/, frontend/system/, frontend/trac/, etc.
 *   ✅ Only trigger once the exact file is verified
 *   🚫 Do NOT assume mcp.ts is at project root or blindly invoke CLI
 *
 * Symbolic systems rely on modular coherence. File placement has meaning.
 */

import { agentState } from '@/system/agentState';
import { logEvent } from '@/system/loopMonitor';
import { serializeTrace } from '@/system/utils/traceSerializer';
import { glob } from 'glob';

export async function findMCPFile(): Promise<string | null> {
  const matches = await glob('frontend/**/mcp.ts');

  if (matches.length === 1) {
    // Log successful resolution
    await logEvent({
      timestamp: new Date().toISOString(),
      input: {
        content: 'CLI path resolution successful',
        timestamp: new Date().toISOString()
      },
      result: {
        summary: `Found mcp.ts at ${matches[0]}`,
        confidence: 1.0,
        timestamp: new Date().toISOString()
      },
      trace: serializeTrace(['cliPathResolver:success', matches[0]]),
      stateSnapshot: agentState
    });
    return matches[0];
  }

  if (matches.length > 1) {
    console.warn('⚠️ Multiple mcp.ts files found. Please confirm the correct one:');
    matches.forEach((m, i) => console.log(`${i + 1}. ${m}`));
    
    // Log ambiguity
    await logEvent({
      timestamp: new Date().toISOString(),
      input: {
        content: 'CLI path resolution ambiguous',
        timestamp: new Date().toISOString()
      },
      result: {
        summary: `Found ${matches.length} potential mcp.ts files`,
        confidence: 0.5,
        timestamp: new Date().toISOString()
      },
      trace: serializeTrace(['cliPathResolver:ambiguous', matches]),
      stateSnapshot: agentState
    });
    return null;
  }

  console.error('❌ No mcp.ts file found in expected locations.');
  
  // Log failure
  await logEvent({
    timestamp: new Date().toISOString(),
    input: {
      content: 'CLI path resolution failed',
      timestamp: new Date().toISOString()
    },
    result: {
      summary: 'No mcp.ts file found in expected locations',
      confidence: 0.0,
      timestamp: new Date().toISOString()
    },
    trace: serializeTrace(['cliPathResolver:failure']),
    stateSnapshot: agentState
  });
  return null;
}

export async function executeCLICommand(flag: string): Promise<void> {
  const mcpPath = await findMCPFile();
  if (!mcpPath) {
    console.error('Cannot execute CLI command: mcp.ts not found');
    return;
  }

  const { exec } = require('child_process');
  exec(`node ${mcpPath} ${flag}`, (err: Error | null, stdout: string, stderr: string) => {
    if (err) {
      console.error(`❌ Execution error:\n${stderr}`);
    } else {
      console.log(`✅ CLI Output:\n${stdout}`);
    }
  });
}

// Symbolic context for internal memory
export const symbolicCLIContext = {
  symbolicIntent: "Preserve CLI modularity by ensuring Trac always finds the correct symbolic entrypoint (mcp.ts).",
  appliesTo: ["resonance", "skills", "web", "desires", "loopConnector", "mine-skills"],
  origin: "Advisor Audit 2025-05-20",
  importance: "High – foundational for modular CLI execution integrity"
}; 