import * as fs from 'fs/promises';
import { join } from 'path';
import { invokeLLM } from '../../frontend/llm/invokeLLM';

export interface DreamAnalysis {
  dream: string;
  themes: string[];
  emotions: string[];
  symbolicSuggestions: string[];
}

export async function interpretLatestDream(): Promise<DreamAnalysis | null> {
  const path = join(process.cwd(), 'logs', 'dream-journal.jsonl');
  try {
    const content = await fs.readFile(path, 'utf-8');
    const entries = content.trim().split('\n').map(line => JSON.parse(line));
    const latest = entries.pop();
    if (!latest?.dream) return null;

    const response = await invokeLLM({
      prompt: `
You are TracAgent's symbolic analyst. Interpret the following dream from a symbolic perspective:

Dream:
"${latest.dream}"

Return your analysis in structured JSON:
- themes (string[])
- emotions (string[])
- symbolicSuggestions (string[])
      `.trim(),
      systemMessage: "You are TracAgent's dream interpreter.",
      temperature: 0.6,
      maxTokens: 800
    });

    const parsed = JSON.parse(response);
    return {
      dream: latest.dream,
      themes: parsed.themes || [],
      emotions: parsed.emotions || [],
      symbolicSuggestions: parsed.symbolicSuggestions || []
    };
  } catch (err) {
    console.error('Dream interpretation failed:', err);
    return null;
  }
} 