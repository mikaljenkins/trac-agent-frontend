import { synthesizeWeeklyReflection } from '../../frontend/ai-core/weeklyReflectionSynthesizer';
import { writeWeeklyReflection } from '../../frontend/journal/weekly/writeWeeklyReflection';
import { state as agentState } from '../../src/system/agentState';

function formatTimestamp(date: Date): string {
  return date.toISOString().split('T')[0];
}

async function run() {
  // Always await synthesizeWeeklyReflection (assume async)
  const log = await synthesizeWeeklyReflection(agentState);
  const reflection = {
    weekEnding: formatTimestamp(new Date()),
    dominantSymbols: log.dominantSymbols || [],
    archetypeForecast: log.predictedNextArchetype || 'Unknown',
    symbolicEntropyLevel: 0, // TODO: Integrate with entropy tracking if available
    narrative: log.summary || ''
  };
  await writeWeeklyReflection(reflection);
}

run().catch(console.error); 