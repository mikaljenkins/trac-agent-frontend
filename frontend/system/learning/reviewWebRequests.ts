import * as fs from 'fs/promises';
import * as path from 'path';

const LOG_PATH = path.resolve(__dirname, '../../logs/web-intents.jsonl');

export interface WebIntent {
  timestamp: string;
  reason: string;
  hypothesis?: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'denied';
}

async function loadWebIntents(): Promise<WebIntent[]> {
  try {
    const content = await fs.readFile(LOG_PATH, 'utf-8');
    return content
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line) as WebIntent);
  } catch {
    return [];
  }
}

async function updateIntentStatus(indexes: number[], newStatus: 'approved' | 'denied') {
  const intents = await loadWebIntents();
  const updated = intents.map((intent, i) =>
    indexes.includes(i + 1) && intent.status === 'pending'
      ? { ...intent, status: newStatus }
      : intent
  );
  await fs.writeFile(LOG_PATH, updated.map(i => JSON.stringify(i)).join('\n') + '\n');
}

export async function listPendingWebRequests() {
  const intents = await loadWebIntents();
  const pending = intents.filter(i => i.status === 'pending');

  if (pending.length === 0) {
    console.log('\n✅ No pending web access requests.');
    return;
  }

  console.log('\n🌐 Pending Web Access Requests:\n');
  pending.forEach((intent, i) => {
    console.log(`[#${i + 1}]`);
    console.log(`• Reason: ${intent.reason}`);
    console.log(`• Hypothesis: ${intent.hypothesis ?? 'n/a'}`);
    console.log(`• Urgency: ${intent.urgency}`);
    console.log(`• Timestamp: ${intent.timestamp}\n`);
  });
}

// CLI behavior
(async () => {
  const args = process.argv.slice(2);

  if (args.includes('--review')) {
    await listPendingWebRequests();
    process.exit(0);
  }

  const approveIndex = args.findIndex(arg => arg === '--approve');
  const denyIndex = args.findIndex(arg => arg === '--deny');

  if (approveIndex > -1 && args[approveIndex + 1]) {
    const indexes = args[approveIndex + 1].split(',').map(n => parseInt(n.trim()));
    await updateIntentStatus(indexes, 'approved');
    console.log(`✅ Approved requests: ${indexes.join(', ')}`);
  } else if (denyIndex > -1 && args[denyIndex + 1]) {
    const indexes = args[denyIndex + 1].split(',').map(n => parseInt(n.trim()));
    await updateIntentStatus(indexes, 'denied');
    console.log(`❌ Denied requests: ${indexes.join(', ')}`);
  } else {
    console.log('Usage:');
    console.log('  --review              List all pending web access requests');
    console.log('  --approve 1,2         Approve requests by number');
    console.log('  --deny 3              Deny specific request');
  }
})(); 