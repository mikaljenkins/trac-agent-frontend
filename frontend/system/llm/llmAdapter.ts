import { AgentResult } from '@/types/agent';
import { LLM_CONFIG } from '../config';

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
  const { url } = LLM_CONFIG.mistral;

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
    throw new Error(`Mistral API error: ${res.statusText}`);
  }

  const data = await res.json();
  return data.response || '[Mistral] No response';
}

async function callDeepSeek(prompt: string): Promise<string> {
  const { url } = LLM_CONFIG.deepseek;

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
    throw new Error(`DeepSeek API error: ${res.statusText}`);
  }

  const data = await res.json();
  return data.response || '[DeepSeek] No response';
} 