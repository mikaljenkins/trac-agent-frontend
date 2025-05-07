import fs from 'fs/promises';
import path from 'path';
import { WeeklyReflectionEntry } from '../../ai-core/weeklyReflectionSynthesizer';

export async function writeWeeklyReflection(reflection: WeeklyReflectionEntry) {
  const journalDir = path.join(process.cwd(), 'journal', 'weekly');
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const fileName = `weekly-${date}.json`;
  const filePath = path.join(journalDir, fileName);

  try {
    await fs.mkdir(journalDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(reflection, null, 2), 'utf-8');
    console.log(`✅ Weekly reflection saved to ${filePath}`);
  } catch (err) {
    console.error(`❌ Failed to write weekly reflection:`, err);
  }
} 