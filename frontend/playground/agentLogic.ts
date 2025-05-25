/**
 * 🧪 PLAYGROUND CONSTITUTION 🧪
 *
 * The `playground/` directory is an active symbolic domain used for
 * controlled experimentation, with safety checks and defined symbolic boundaries.
 * Guardrails apply.
 */

import { storeToVault } from '../system/symbolic/symbolicMemoryVault';
import { SandboxResponse, generateSandboxResponse } from './sandboxResponses';

export interface PlaygroundState {
  currentResponse: SandboxResponse;
  experimentCount: number;
  lastExperiment: string;
}

export async function runGuidedExperiment(input: string): Promise<SandboxResponse> {
  const timestamp = new Date().toISOString();
  const response = generateSandboxResponse(input);
  
  const sandboxResponse = {
    timestamp,
    input: { content: input },
    result: {
      summary: response,
      symbolicTag: 'playground::guided-process'
    },
    metadata: {
      supervised: true,
      domain: 'playground'
    }
  };

  await storeToVault(sandboxResponse, 'logs/playground-thread.jsonl');
  return sandboxResponse;
} 