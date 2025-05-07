import fs from 'fs/promises';
import path from 'path';
import { SymbolicTrace, SymbolicMutation } from '@/types/trace';

export async function getAllTraces(): Promise<SymbolicTrace[]> {
  try {
    const debugTracesDir = path.join(process.cwd(), 'debug-traces');
    
    // Check if directory exists
    try {
      await fs.access(debugTracesDir);
    } catch {
      return []; // Return empty array if directory doesn't exist
    }

    // Read all trace files
    const files = await fs.readdir(debugTracesDir);
    const traceFiles = files.filter(file => file.startsWith('trace-') && file.endsWith('.json') && !file.includes('-mutations'));

    // Read and parse each trace file
    const traces = await Promise.all(
      traceFiles.map(async (file) => {
        const traceId = file.replace('trace-', '').replace('.json', '');
        const content = await fs.readFile(path.join(debugTracesDir, file), 'utf-8');
        const trace = JSON.parse(content) as SymbolicTrace;
        
        // Try to load mutations if they exist
        try {
          const mutationsPath = path.join(debugTracesDir, `trace-${traceId}-mutations.json`);
          await fs.access(mutationsPath);
          const mutationsContent = await fs.readFile(mutationsPath, 'utf-8');
          const mutations = JSON.parse(mutationsContent) as Record<string, SymbolicMutation[]>;
          
          // Attach mutations to their respective stages
          trace.stages = trace.stages.map(stage => ({
            ...stage,
            mutations: mutations[stage.step] || []
          }));
        } catch {
          // No mutations file exists, continue without mutations
        }
        
        return trace;
      })
    );

    // Sort by timestamp descending
    return traces.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error reading traces:', error);
    return [];
  }
}

export async function getTraceById(traceId: string): Promise<SymbolicTrace | null> {
  try {
    const debugTracesDir = path.join(process.cwd(), 'debug-traces');
    const filePath = path.join(debugTracesDir, `trace-${traceId}.json`);
    
    const content = await fs.readFile(filePath, 'utf-8');
    const trace = JSON.parse(content) as SymbolicTrace;

    // Try to load mutations if they exist
    try {
      const mutationsPath = path.join(debugTracesDir, `trace-${traceId}-mutations.json`);
      await fs.access(mutationsPath);
      const mutationsContent = await fs.readFile(mutationsPath, 'utf-8');
      const mutations = JSON.parse(mutationsContent) as Record<string, SymbolicMutation[]>;
      
      // Attach mutations to their respective stages
      trace.stages = trace.stages.map(stage => ({
        ...stage,
        mutations: mutations[stage.step] || []
      }));
    } catch {
      // No mutations file exists, continue without mutations
    }

    return trace;
  } catch (error) {
    console.error(`Error reading trace ${traceId}:`, error);
    return null;
  }
}

export function extractPrimarySymbols(trace: SymbolicTrace): string[] {
  const symbols = new Set<string>();
  
  trace.stages.forEach(stage => {
    if (stage.insights) {
      stage.insights.forEach(insight => {
        // Extract words that might be symbols (capitalized or in quotes)
        const matches = insight.match(/"([^"]+)"|([A-Z][a-z]+)/g);
        if (matches) {
          matches.forEach(match => symbols.add(match.replace(/"/g, '')));
        }
      });
    }
  });

  return Array.from(symbols);
}

export function getInsightCount(trace: SymbolicTrace): number {
  return trace.stages.reduce((count, stage) => 
    count + (stage.insights?.length || 0), 0);
}

export function getMutationCount(trace: SymbolicTrace): number {
  return trace.stages.reduce((count, stage) => 
    count + (stage.mutations?.length || 0), 0);
}

export function hasMutations(trace: SymbolicTrace): boolean {
  return trace.stages.some(stage => stage.mutations && stage.mutations.length > 0);
} 