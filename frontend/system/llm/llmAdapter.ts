import { AgentResult } from '@/types/agent';

export type SupportedLLM = 'mistral' | 'deepseek';

export async function llmAdapter(model: SupportedLLM, prompt: string): Promise<AgentResult> {
  let response: string;
  
  switch (model) {
    case 'mistral':
      response = await callMistral(prompt);
      break;
    case 'deepseek':
      response = await callDeepSeek(prompt);
      break;
    default:
      throw new Error(`Unsupported model: ${model}`);
  }

  // Wrap LLM response in symbolic format
  return {
    type: 'symbolic',
    confidence: 0.85,
    summary: response,
    timestamp: new Date().toISOString(),
    symbolicWeight: 0.8,
    archetypeAlignment: 0.5,
    feedbackTag: 'processed'
  };
}

async function callMistral(prompt: string): Promise<string> {
  const url = process.env.MISTRAL_API_URL;
  if (!url) {
    throw new Error('MISTRAL_API_URL environment variable is not set');
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral',
      prompt,
      stream: false,
    }),
  });

  if (!res.ok) {
    throw new Error(`[Error] LLM call failed with status ${res.status}`);
  }

  const data = await res.json();
  return data.response || '[Error] No response returned.';
}

async function callDeepSeek(prompt: string): Promise<string> {
  const url = process.env.DEEPSEEK_API_URL;
  if (!url) {
    throw new Error('DEEPSEEK_API_URL environment variable is not set');
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-coder-v2',
      prompt,
      stream: false,
    }),
  });

  if (!res.ok) {
    throw new Error(`[Error] LLM call failed with status ${res.status}`);
  }

  const data = await res.json();
  return data.response || '[Error] No response returned.';
} 