import fs from 'fs';
import path from 'path';
import { SelfAuditLogEntry } from './self-audit-log-schema';

const LOG_PATH = path.resolve(process.cwd(), 'dev/audit-log.json');

function readLogFile(): SelfAuditLogEntry[] {
  try {
    if (!fs.existsSync(LOG_PATH)) return [];
    const data = fs.readFileSync(LOG_PATH, 'utf-8');
    return JSON.parse(data) as SelfAuditLogEntry[];
  } catch (err) {
    console.error('[auditLogStore] Failed to read log file:', err);
    return [];
  }
}

function writeLogFile(logs: SelfAuditLogEntry[]) {
  try {
    fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
    fs.writeFileSync(LOG_PATH, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (err) {
    console.error('[auditLogStore] Failed to write log file:', err);
  }
}

export function addAuditLog(entry: SelfAuditLogEntry) {
  const logs = readLogFile();
  logs.push(entry);
  writeLogFile(logs);
}

export function getAuditLogs(count: number = 50): SelfAuditLogEntry[] {
  const logs = readLogFile();
  return logs.slice(-count);
}

export function clearAuditLogs() {
  writeLogFile([]);
} 