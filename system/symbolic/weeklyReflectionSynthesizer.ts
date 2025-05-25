import { removeCircular } from '../../frontend/lib/utils';
import { detectAlignmentDrift } from '../../frontend/system/symbolic/alignmentDrift';
import { recognizePatterns } from '../../frontend/system/symbolic/patternRecognizer';
import type { AgentInput, AgentResult, AgentState, ImprovementCandidate } from '../../frontend/types/agent';

// Define the type for a journal entry
interface JournalEntry {
  input: AgentInput;
  result: AgentResult;
  reflection: ImprovementCandidate[];
  state: AgentState;
  timestamp: string;
}

// Define the type for a formatted reflection
interface FormattedReflection {
  module: string;
  issue: string;
  fix: string;
}

/**
 * Logs a reflection entry to the journal
 */
export async function journalReflection(entry: JournalEntry) {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const logPath = path.join(process.cwd(), 'logs', 'weekly-reflections.jsonl');
    
    // Ensure logs directory exists
    await fs.promises.mkdir(path.join(process.cwd(), 'logs'), { recursive: true });
    
    // Create safe entry with circular references removed
    const safeEntry = {
      ...entry,
      state: removeCircular(entry.state),
      result: removeCircular(entry.result),
      input: removeCircular(entry.input),
      reflection: entry.reflection.map(r => ({
        ...r,
        proposedFix: r.proposedFix || '', // Ensure string
      })),
    };
    
    // Append to journal file
    await fs.promises.appendFile(
      logPath,
      JSON.stringify(safeEntry) + '\n',
      'utf8'
    );
  } catch (error) {
    console.error('Failed to journal reflection:', error);
  }
}

/**
 * Runs the weekly synthesis process
 */
export async function runWeeklySynthesis() {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const logPath = path.join(process.cwd(), 'logs', 'weekly-reflections.jsonl');
    
    // Read all entries from the journal
    const entries = await fs.promises.readFile(logPath, 'utf8')
      .then(content => content.split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line) as JournalEntry)
      );
    
    // Group entries by week
    const weeklyGroups = entries.reduce((groups, entry) => {
      const date = new Date(entry.timestamp);
      const weekKey = `${date.getFullYear()}-W${getWeekNumber(date)}`;
      if (!groups[weekKey]) groups[weekKey] = [];
      groups[weekKey].push(entry);
      return groups;
    }, {} as Record<string, JournalEntry[]>);
    
    // Generate synthesis for each week
    const synthesis = Object.entries(weeklyGroups).map(([week, entries]) => {
      // Get all reflections for this week
      const allReflections = entries.flatMap(e => e.reflection || []);
      
      // Generate pattern summary
      const patternSummary = recognizePatterns(allReflections);
      
      // Get latest state for alignment drift detection
      const latestState = entries[entries.length - 1].state;
      const alignmentWarnings = detectAlignmentDrift(latestState);
      
      return {
        week,
        entryCount: entries.length,
        reflections: allReflections.map(r => ({
          module: r.sourceModule || 'unknown',
          issue: r.issue || 'unspecified',
          fix: r.proposedFix || 'none proposed'
        })),
        repeatedIssues: patternSummary,
        alignmentDriftWarnings: alignmentWarnings,
        summary: `Week ${week} had ${entries.length} entries, ${allReflections.length} reflections, ${Object.keys(patternSummary).length} recurring issues.`
      };
    });
    
    return synthesis;
  } catch (error) {
    console.error('Failed to run weekly synthesis:', error);
    throw error;
  }
}

/**
 * Gets the ISO week number for a date
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

if (require.main === module) {
  runWeeklySynthesis().then(console.dir).catch(console.error);
} 