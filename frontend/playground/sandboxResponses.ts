/**
 * 🧪 SANDBOX RESPONSE HANDLER
 *
 * Handles supervised responses for the playground symbolic system.
 * Responses are used for controlled symbolic experiments.
 */

export interface SandboxResponse {
  timestamp: string;
  input: {
    content: string;
  };
  result: {
    summary: string;
    symbolicTag: string;
  };
  metadata: {
    supervised: boolean;
    domain: string;
  };
}

export const sandboxResponses: SandboxResponse[] = [];

export function generateSandboxResponse(input: string): string {
  return `[PLAYGROUND] Received: ${input}`;
}

export function addSandboxResponse(
  content: string,
  summary: string,
  symbolicTag: string
): SandboxResponse {
  const newResponse: SandboxResponse = {
    timestamp: new Date().toISOString(),
    input: { content },
    result: {
      summary,
      symbolicTag
    },
    metadata: {
      supervised: true,
      domain: 'playground'
    }
  };

  sandboxResponses.push(newResponse);
  return newResponse;
} 