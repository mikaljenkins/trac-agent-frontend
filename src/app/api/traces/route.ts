import { NextResponse } from 'next/server';
import { getAllTraces, getTraceById } from '@/lib/trac-utils/traceReader';

export async function GET(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Trace viewer is only available in development' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const traceId = searchParams.get('traceId');

  try {
    if (traceId) {
      const trace = await getTraceById(traceId);
      if (!trace) {
        return NextResponse.json(
          { error: 'Trace not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(trace);
    }

    const traces = await getAllTraces();
    return NextResponse.json(traces);
  } catch (error) {
    console.error('Error handling trace request:', error);
    return NextResponse.json(
      { error: 'Failed to process trace request' },
      { status: 500 }
    );
  }
} 