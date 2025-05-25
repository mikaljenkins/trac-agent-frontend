import * as fs from 'fs/promises';
import { join } from 'path';

export async function interpretLatestDream(): Promise<string> {
  const logPath = join(process.cwd(), 'logs', 'dream-journal.jsonl');

  try {
    const content = await fs.readFile(logPath, 'utf-8');
    const lines = content.trim().split('\n');
    const lastEntry = lines.length ? JSON.parse(lines[lines.length - 1]) : null;

    if (!lastEntry || !lastEntry.dream) {
      return 'No dreams found to interpret.';
    }

    // Optional: symbolic summarization logic
    const summary = summarizeDream(lastEntry.dream);
    return `🧠 Dream Summary:\n${summary}`;
  } catch (err) {
    return `Failed to interpret dream: ${err.message}`;
  }
}

function summarizeDream(dream: string): string {
  const lines = dream.split(/[.!?]\s+/);
  return lines.slice(0, 3).join('. ') + (lines.length > 3 ? '...' : '');
} 