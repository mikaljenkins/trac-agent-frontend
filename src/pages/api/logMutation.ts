import fs from 'fs/promises';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import { MutationLogEntry } from '@/time-chamber/mutationLogger';
import { getLogDirectory, getLogFilePath } from '@/time-chamber/logPathManager';

const ensureLogDirectory = async () => {
  const logDir = getLogDirectory();
  try {
    await fs.access(logDir);
  } catch {
    await fs.mkdir(logDir, { recursive: true });
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { mutation } = req.body;

  if (!mutation || !mutation.id || !mutation.simulationId) {
    return res.status(400).json({ error: 'Invalid mutation data' });
  }

  try {
    // Ensure log directory exists
    await ensureLogDirectory();

    // Get log file path for today
    const logPath = getLogFilePath(new Date(mutation.timestamp));

    // Read existing logs
    let logs: MutationLogEntry[] = [];
    try {
      const existing = await fs.readFile(logPath, 'utf-8');
      logs = JSON.parse(existing);
    } catch (error) {
      // If file doesn't exist or is invalid, start with empty array
      logs = [];
    }

    // Add new mutation
    logs.push(mutation);

    // Write back to file
    await fs.writeFile(logPath, JSON.stringify(logs, null, 2));

    // Return success with the logged mutation and file info
    return res.status(200).json({ 
      success: true, 
      mutation,
      logFile: path.basename(logPath),
      logDir: getLogDirectory()
    });
  } catch (err) {
    console.error('[LOG MUTATION ERROR]', err);
    return res.status(500).json({ 
      error: 'Log write failed',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
} 