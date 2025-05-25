/**
 * 🧠 SYMBOLIC MEMORY VAULT
 *
 * Handles safe append-only storage of symbolic entries.
 * Supports journaling, snapshots, and backups.
 */

import fs from 'fs/promises';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');

export async function storeToVault(entry: any, file = 'symbolic-vault.jsonl') {
  const line = JSON.stringify(entry) + '\n';
  await fs.mkdir(LOG_DIR, { recursive: true });
  await fs.appendFile(path.join(LOG_DIR, file), line);
}

export async function readVault(file = 'symbolic-vault.jsonl') {
  try {
    const content = await fs.readFile(path.join(LOG_DIR, file), 'utf-8');
    return content.split('\n').filter(Boolean).map(line => JSON.parse(line));
  } catch {
    return [];
  }
} 