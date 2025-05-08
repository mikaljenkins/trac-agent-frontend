import fs from 'fs/promises';
import path from 'path';
import { generateSymbolicForecast } from '@/ai-core/symbolicForecaster';
import { weeklyTrigger } from '@/ai-core/loopMonitor';
import { AgentState } from '@/ai-core/types';

interface SymbolicForecast {
  symbol: string;
  projectedDecay: number;
  likelyDrift: boolean;
  confidence: number;
  archetypeInfluence: string[];
  forecastNarrative: string;
}

interface ForecastExport {
  timestamp: string;
  forecasts: SymbolicForecast[];
  metadata: {
    totalSymbols: number;
    averageConfidence: number;
    dominantArchetype: string;
    topSymbols: Array<{
      symbol: string;
      confidence: number;
    }>;
    driftPredictions: Array<{
      symbol: string;
      likelihood: number;
    }>;
  };
  agentState: AgentState;
}

async function fetchAgentState(): Promise<AgentState | null> {
  try {
    const statePath = path.join(process.cwd(), 'system', 'state.json');
    const stateData = await fs.readFile(statePath, 'utf-8');
    return JSON.parse(stateData);
  } catch (error) {
    console.error('Failed to fetch agent state:', error);
    return null;
  }
}

async function ensureExportDirectory() {
  const exportDir = path.join(process.cwd(), 'journal', 'forecast');
  try {
    await fs.access(exportDir);
  } catch {
    await fs.mkdir(exportDir, { recursive: true });
  }
  return exportDir;
}

async function getLastExportDate(exportDir: string): Promise<Date | null> {
  try {
    const files = await fs.readdir(exportDir);
    const forecastFiles = files.filter(f => f.startsWith('forecast-') && f.endsWith('.json'));
    
    if (forecastFiles.length === 0) return null;
    
    const lastFile = forecastFiles.sort().pop();
    const dateStr = lastFile?.split('forecast-')[1].split('.json')[0];
    return dateStr ? new Date(dateStr) : null;
  } catch (error) {
    console.error('Failed to get last export date:', error);
    return null;
  }
}

async function exportForecast() {
  try {
    // Check if 7 days have passed since last export
    const exportDir = await ensureExportDirectory();
    const lastExport = await getLastExportDate(exportDir);
    const now = new Date();
    
    if (lastExport && (now.getTime() - lastExport.getTime()) < 7 * 24 * 60 * 60 * 1000) {
      console.log('Skipping export: Less than 7 days since last export');
      return;
    }

    // Fetch current state
    const agentState = await fetchAgentState();
    if (!agentState) {
      throw new Error('Failed to fetch agent state');
    }

    // Generate forecasts
    const forecasts = await generateSymbolicForecast(agentState);

    // Calculate metadata
    const totalSymbols = forecasts.length;
    const averageConfidence = forecasts.reduce((sum: number, f: SymbolicForecast) => sum + f.confidence, 0) / totalSymbols;
    
    // Get archetype frequencies
    const archetypeCounts = forecasts.reduce((acc: Record<string, number>, f: SymbolicForecast) => {
      f.archetypeInfluence.forEach((archetype: string) => {
        acc[archetype] = (acc[archetype] || 0) + 1;
      });
      return acc;
    }, {});
    
    const dominantArchetype = Object.entries(archetypeCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'None';

    // Prepare export data
    const exportData: ForecastExport = {
      timestamp: now.toISOString(),
      forecasts,
      metadata: {
        totalSymbols,
        averageConfidence,
        dominantArchetype,
        topSymbols: forecasts
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 5)
          .map(f => ({ symbol: f.symbol, confidence: f.confidence })),
        driftPredictions: forecasts
          .filter(f => f.likelyDrift)
          .map(f => ({ symbol: f.symbol, likelihood: f.projectedDecay })),
      },
      agentState,
    };

    // Save to file
    const dateStr = now.toISOString().split('T')[0];
    const filePath = path.join(exportDir, `forecast-${dateStr}.json`);
    await fs.writeFile(filePath, JSON.stringify(exportData, null, 2));

    console.log(`Successfully exported forecast to ${filePath}`);
  } catch (error) {
    console.error('Failed to export forecast:', error);
  }
}

// Register with weekly trigger
weeklyTrigger.register('exportForecast', exportForecast);

// Export immediately if this is the first run
exportForecast().catch(console.error); 