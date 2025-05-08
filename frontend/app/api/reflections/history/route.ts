import { NextRequest, NextResponse } from 'next/server';
import { WeeklyReflectionEntry } from '../../../ai-core/weeklyReflectionSynthesizer';
import fs from 'fs/promises';
import path from 'path';

type TimeRange = 'week' | 'month' | 'year';

const RANGE_MS: Record<TimeRange, number> = {
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = (searchParams.get('range') || 'month') as TimeRange;
    
    // Load reflections from journal directory
    const journalDir = path.join(process.cwd(), 'journal', 'weekly');
    const files = await fs.readdir(journalDir);
    
    // Filter and sort reflection files
    const reflectionFiles = files
      .filter(file => file.endsWith('.json'))
      .sort((a, b) => b.localeCompare(a)); // Most recent first
    
    // Load and parse reflection entries
    const reflections: WeeklyReflectionEntry[] = [];
    for (const file of reflectionFiles) {
      const content = await fs.readFile(path.join(journalDir, file), 'utf-8');
      const entry = JSON.parse(content) as WeeklyReflectionEntry;
      
      // Apply time range filter
      const entryDate = new Date(entry.timestamp);
      const now = new Date();
      const rangeInMs = RANGE_MS[range];
      
      if (now.getTime() - entryDate.getTime() <= rangeInMs) {
        reflections.push(entry);
      }
    }
    
    return NextResponse.json(reflections);
  } catch (error) {
    console.error('Failed to load reflection history:', error);
    return NextResponse.json(
      { error: 'Failed to load reflection history' },
      { status: 500 }
    );
  }
} 