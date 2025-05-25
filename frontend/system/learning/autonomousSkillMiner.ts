import * as fs from 'fs/promises';
import * as path from 'path';
import type { SkillSeed } from './skillSeeds';
import { skillSeeds } from './skillSeeds';

const LOGS_DIR = path.join(process.cwd(), 'logs');

const LOG_SOURCES = [
  'symbolic-plans.jsonl',
  'dream-journal.jsonl',
  'weekly-reflections.jsonl',
  'meta-pulse.jsonl'
];

async function writeSkillSeed(seed: SkillSeed): Promise<void> {
  skillSeeds.push(seed);
}

function extractCandidateSeeds(logText: string): SkillSeed[] {
  const candidates: SkillSeed[] = [];

  const lines = logText.split('\n').filter(Boolean);
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      const text = JSON.stringify(entry);

      // Naive scan for capability statements
      if (text.includes('should learn') || text.includes('needs to understand')) {
        candidates.push({
          name: 'Skill: ' + text.slice(0, 64),
          purpose: 'Extracted from symbolic log insight',
          dependencies: [],
          status: 'pending',
          notes: text.slice(0, 500)
        });
      }
    } catch (e) {
      console.warn('Could not parse log line:', line);
    }
  }

  return candidates;
}

export async function mineSkillSeedsFromLogs(): Promise<SkillSeed[]> {
  const newSeeds: SkillSeed[] = [];

  for (const file of LOG_SOURCES) {
    const filePath = path.join(LOGS_DIR, file);
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const seeds = extractCandidateSeeds(raw);
      for (const seed of seeds) {
        await writeSkillSeed(seed);
        newSeeds.push(seed);
      }
    } catch (e) {
      console.warn(`Skipping ${file}:`, e);
    }
  }

  return newSeeds;
} 