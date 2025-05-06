import { NextResponse } from 'next/server';
import { loadSymbolicMemories, findRelevantMemories } from '@/lib/memory/symbolicServerManager';

export async function GET() {
  const testInput = "Cursor is starting to behave like a teammate. It's learning how I think.";
  const nodes = await loadSymbolicMemories();
  const result = findRelevantMemories(testInput, nodes);
  return NextResponse.json(result);
} 