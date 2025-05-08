import fs from 'fs/promises';
import path from 'path';
import { LLMResponse } from '../../ai-core/invokeLLM';

export interface JournaledInvocation extends LLMResponse {
  timestamp: string;
  journalPath: string;
}

/**
 * Persists an LLM response to the daily invocation journal.
 * Creates a new file for each day in /journal/invocations/invoke-YYYY-MM-DD.json
 */
export async function writeLLMInvocation(response: LLMResponse): Promise<JournaledInvocation> {
  const journalDir = path.join(process.cwd(), 'journal', 'invocations');
  const date = new Date().toISOString().split('T')[0];
  const fileName = `invoke-${date}.json`;
  const filePath = path.join(journalDir, fileName);

  try {
    // Ensure journal directory exists
    await fs.mkdir(journalDir, { recursive: true });

    // Read existing journal if it exists
    let journal: JournaledInvocation[] = [];
    try {
      const existingContent = await fs.readFile(filePath, 'utf-8');
      journal = JSON.parse(existingContent);
    } catch (err) {
      // File doesn't exist yet, start with empty array
      journal = [];
    }

    // Create journal entry with metadata
    const entry: JournaledInvocation = {
      ...response,
      timestamp: new Date().toISOString(),
      journalPath: filePath
    };

    // Append new entry
    journal.push(entry);

    // Write updated journal
    await fs.writeFile(filePath, JSON.stringify(journal, null, 2), 'utf-8');
    console.log(`📝 LLM response saved to ${filePath}`);

    return entry;
  } catch (err) {
    console.error(`❌ Failed to write LLM invocation:`, err);
    throw err; // Re-throw to allow caller to handle failure
  }
}

/**
 * Reads all invocations for a given date.
 * Returns empty array if no journal exists for that date.
 */
export async function readInvocationsForDate(date: string): Promise<JournaledInvocation[]> {
  const journalDir = path.join(process.cwd(), 'journal', 'invocations');
  const fileName = `invoke-${date}.json`;
  const filePath = path.join(journalDir, fileName);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    // Return empty array if file doesn't exist
    return [];
  }
} 