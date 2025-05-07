import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: { traceId: string } }
) {
  const { traceId } = params;
  const tracePath = path.join(process.cwd(), 'debug-traces', `trace-${traceId}.json`);
  try {
    const content = await fs.readFile(tracePath, 'utf-8');
    const trace = JSON.parse(content);
    return NextResponse.json(trace);
  } catch (error) {
    return NextResponse.json({ error: 'Trace not found' }, { status: 404 });
  }
} 