import { NextResponse } from 'next/server';
import { getTracMemoryHistory } from '@/lib/getTracMemoryHistory';

export async function GET() {
  try {
    const history = await getTracMemoryHistory();
    return NextResponse.json(history);
  } catch (error) {
    console.error('Failed to fetch memory history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memory history' },
      { status: 500 }
    );
  }
} 