import { NextResponse } from 'next/server';
import { loadSymbolicMemories, findRelevantMemories } from '@/lib/memory/symbolicServerManager';

export async function POST(request: Request) {
  const { input } = await request.json();
  const nodes = await loadSymbolicMemories();
  const result = findRelevantMemories(input, nodes);
  return NextResponse.json(result);
} 