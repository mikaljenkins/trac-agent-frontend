import { NextResponse } from 'next/server';
import { getTracResponse } from '@/lib/getTracResponse';

export async function POST(request: Request) {
  const { input } = await request.json();
  const response = await getTracResponse(input);
  return NextResponse.json({ response });
} 