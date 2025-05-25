
export interface SandboxResponse {
  id: string;
  timestamp: string;
  input: string;
  response: string;
  confidence: number;
  metadata: {
    style: 'logical' | 'imaginative' | 'skeptical';
    agent: 'TracAgent' | 'TracFriend';
    requiresPeerReview: boolean;
  };
}

export const sandboxResponses: SandboxResponse[] = [];

export function addSandboxResponse(
  input: string,
  response: string,
  style: 'logical' | 'imaginative' | 'skeptical' = 'logical',
  agent: 'TracAgent' | 'TracFriend' = 'TracAgent',
  confidence: number = 0.5
): SandboxResponse {
  const newResponse: SandboxResponse = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    input,
    response,
    confidence,
    metadata: {
      style,
      agent,
      requiresPeerReview: confidence < 0.7
    }
  };

  sandboxResponses.push(newResponse);
  return newResponse;
} 