import { NextResponse } from 'next/server';
import { SymbolicMemoryNode } from '../../../ai-core/memorySync';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // Try to load from agent state first
    const statePath = path.join(process.cwd(), 'system', 'state.json');
    const content = await fs.readFile(statePath, 'utf-8');
    const state = JSON.parse(content);
    
    if (state.symbolicMemory) {
      return NextResponse.json(state.symbolicMemory as SymbolicMemoryNode[]);
    }
    
    // Fallback to memory sync file
    const memoryPath = path.join(process.cwd(), 'memory', 'symbolic.json');
    const memoryContent = await fs.readFile(memoryPath, 'utf-8');
    const memory = JSON.parse(memoryContent) as SymbolicMemoryNode[];
    
    return NextResponse.json(memory);
  } catch (error) {
    console.error('Failed to load current memory:', error);
    return NextResponse.json(
      { error: 'Failed to load current memory' },
      { status: 500 }
    );
  }
} 