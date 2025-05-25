import * as fs from 'fs/promises';
import * as path from 'path';

const INTENT_LOG_PATH = path.resolve(__dirname, '../../logs/web-intents.jsonl');

export interface WebIntent {
  timestamp: string;
  reason: string;
  hypothesis?: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'denied';
}

export async function requestWebAccess(intent: Omit<WebIntent, 'timestamp' | 'status'>): Promise<void> {
  const entry: WebIntent = {
    timestamp: new Date().toISOString(),
    ...intent,
    status: 'pending'
  };

  try {
    await fs.mkdir(path.dirname(INTENT_LOG_PATH), { recursive: true });
    await fs.appendFile(INTENT_LOG_PATH, JSON.stringify(entry) + '\n', 'utf8');
    console.log(`🔗 Web access request logged: ${entry.reason}`);
  } catch (error) {
    console.error('Failed to log web request intent:', error);
  }
}

export async function loadPendingWebIntents(): Promise<WebIntent[]> {
  try {
    const content = await fs.readFile(INTENT_LOG_PATH, 'utf8');
    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line) as WebIntent)
      .filter(intent => intent.status === 'pending');
  } catch {
    return [];
  }
} 