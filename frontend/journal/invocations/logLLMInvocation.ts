import fs from 'fs/promises';
import path from 'path';
import { LLMInvocationResult } from '../../ai-core/invokeArchetypeLLM';

export async function logLLMInvocation(result: LLMInvocationResult) {
  const journalDir = path.join(process.cwd(), 'journal', 'invocations');
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const fileName = `invoke-${date}.json`;
  const filePath = path.join(journalDir, fileName);

  try {
    await fs.mkdir(journalDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`✅ LLM invocation logged to ${filePath}`);
  } catch (err) {
    console.error(`❌ Failed to log LLM invocation:`, err);
  }
} 