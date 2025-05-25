import { invokeLLM } from '@/llm/invokeLLM';
import { runSymbolicCompass } from '@/system/symbolic/symbolicCompass';
import { generateSymbolMap } from '@/system/symbolic/symbolMap';
import * as fs from 'fs/promises';
import { join } from 'path';

interface DreamLog {
  timestamp: string;
  dream: string;
}

interface LLMResponse {
  text: string;
  metadata: {
    timestamp: string;
    inputSize: number;
  };
}

export async function digestDreamWithLLM(): Promise<string> {
  const symbolMap = await generateSymbolMap();
  const compass = await runSymbolicCompass();

  const prompt = `
You are the symbolic subconscious of TracAgent.

Generate a dream-style narrative from the following symbols:

• Frequent Issues:
${Object.keys(symbolMap).map((s: string) => `- ${s}`).join('\n')}

• Top Symbols:
${compass.topSymbols.map((s: string) => `- ${s}`).join('\n')}

• Stagnant Symbols:
${compass.stagnantSymbols.map((s: string) => `- ${s}`).join('\n')}

Write a metaphorical dream expressing emotional weight and subconscious meaning behind these symbols. Avoid literal explanation. Tell it like a lucid dream.
`.trim();

  const llmResponse = await invokeLLM({
    prompt,
    systemMessage: "You are TracAgent's dream generator.",
    temperature: 0.85,
    maxTokens: 1000
  }) as LLMResponse;

  const dreamLog: DreamLog = {
    timestamp: new Date().toISOString(),
    dream: llmResponse.text
  };

  const logPath = join(process.cwd(), 'logs', 'dream-journal.jsonl');
  await fs.mkdir(join(process.cwd(), 'logs'), { recursive: true });
  await fs.appendFile(logPath, JSON.stringify(dreamLog) + '\n', 'utf-8');

  return llmResponse.text;
} 