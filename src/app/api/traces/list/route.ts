import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export type TraceListItem = {
  traceId: string;
  input: string;
  timestamp: string;
  insightCount?: number;
  mutationCount?: number;
};

export async function GET(req: NextRequest) {
  const debugTracesDir = path.join(process.cwd(), 'debug-traces');
  try {
    const files = await fs.readdir(debugTracesDir);
    const traceFiles = files.filter(f => f.startsWith('trace-') && f.endsWith('.json') && !f.includes('-mutations'));
    const traces: TraceListItem[] = await Promise.all(traceFiles.map(async (file) => {
      const traceId = file.replace('trace-', '').replace('.json', '');
      const filePath = path.join(debugTracesDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      let input = '';
      let timestamp = '';
      let insightCount = 0;
      try {
        const trace = JSON.parse(content);
        input = (trace.input || '').slice(0, 40);
        timestamp = trace.timestamp || '';
        insightCount = trace.stages?.reduce((acc: number, stage: any) => acc + (stage.insights?.length || 0), 0) || 0;
      } catch {}
      // Try to get mutation count
      let mutationCount = 0;
      try {
        const mutationPath = path.join(debugTracesDir, `trace-${traceId}-mutations.json`);
        const mutationContent = await fs.readFile(mutationPath, 'utf-8');
        const mutations = JSON.parse(mutationContent);
        mutationCount = Object.values(mutations).reduce((acc: number, arr: any) => acc + (Array.isArray(arr) ? arr.length : 0), 0);
      } catch {}
      return { traceId, input, timestamp, insightCount, mutationCount };
    }));
    // Sort by timestamp descending
    traces.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return NextResponse.json(traces);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list traces' }, { status: 500 });
  }
} 