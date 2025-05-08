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

// In-memory cache with TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const reflectionCache = new Map<string, CacheEntry<WeeklyReflectionEntry[]>>();

function validateReflectionEntry(entry: unknown): entry is WeeklyReflectionEntry {
  if (!entry || typeof entry !== 'object') return false;
  
  const e = entry as Partial<WeeklyReflectionEntry>;
  return (
    typeof e.timestamp === 'string' &&
    Array.isArray(e.dominantSymbols) &&
    e.dominantSymbols.every(s => typeof s === 'string') &&
    typeof e.summary === 'string'
  );
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = (searchParams.get('range') || 'month') as TimeRange;
    
    // Check cache
    const cacheKey = `reflections:${range}`;
    const cached = reflectionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }
    
    // Load reflections from journal directory
    const journalDir = path.join(process.cwd(), 'journal', 'weekly');
    const files = await fs.readdir(journalDir);
    
    // Filter and sort reflection files
    const reflectionFiles = files
      .filter(file => file.endsWith('.json'))
      .sort((a, b) => b.localeCompare(a)); // Most recent first
    
    // Load and parse reflection entries
    const reflections: WeeklyReflectionEntry[] = [];
    const now = new Date();
    const rangeInMs = RANGE_MS[range];
    
    for (const file of reflectionFiles) {
      try {
        const content = await fs.readFile(path.join(journalDir, file), 'utf-8');
        const entry = JSON.parse(content);
        
        // Validate entry structure
        if (!validateReflectionEntry(entry)) {
          console.warn(`Invalid reflection entry in ${file}, skipping`);
          continue;
        }
        
        // Apply time range filter
        const entryDate = new Date(entry.timestamp);
        if (now.getTime() - entryDate.getTime() <= rangeInMs) {
          reflections.push(entry);
        }
      } catch (err) {
        console.error(`Failed to process reflection file ${file}:`, err);
        continue; // Skip invalid files
      }
    }
    
    // Update cache
    reflectionCache.set(cacheKey, {
      data: reflections,
      timestamp: Date.now()
    });
    
    return NextResponse.json(reflections);
  } catch (error) {
    console.error('Failed to load reflection history:', error);
    return NextResponse.json(
      { error: 'Failed to load reflection history' },
      { status: 500 }
    );
  }
} 