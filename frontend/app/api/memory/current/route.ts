import { NextResponse } from 'next/server';
import { SymbolicMemoryNode } from '../../../ai-core/memorySync';
import fs from 'fs/promises';
import path from 'path';

// In-memory cache with TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const memoryCache = new Map<string, CacheEntry<SymbolicMemoryNode[]>>();

function validateMemoryNode(node: unknown): node is SymbolicMemoryNode {
  if (!node || typeof node !== 'object') return false;
  
  const n = node as Partial<SymbolicMemoryNode>;
  return (
    typeof n.label === 'string' &&
    typeof n.reinforcementScore === 'number' &&
    typeof n.decayScore === 'number' &&
    Array.isArray(n.connections) &&
    n.connections.every(c => typeof c === 'string')
  );
}

export async function GET() {
  try {
    // Check cache
    const cacheKey = 'current:memory';
    const cached = memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    let memory: SymbolicMemoryNode[] = [];
    
    // Try to load from agent state first
    try {
      const statePath = path.join(process.cwd(), 'system', 'state.json');
      const content = await fs.readFile(statePath, 'utf-8');
      const state = JSON.parse(content);
      
      if (state.symbolicMemory && Array.isArray(state.symbolicMemory)) {
        // Validate each memory node
        memory = state.symbolicMemory.filter(validateMemoryNode);
        if (memory.length > 0) {
          // Update cache
          memoryCache.set(cacheKey, {
            data: memory,
            timestamp: Date.now()
          });
          return NextResponse.json(memory);
        }
      }
    } catch (err) {
      console.warn('Failed to load from agent state, trying fallback:', err);
    }
    
    // Fallback to memory sync file
    try {
      const memoryPath = path.join(process.cwd(), 'memory', 'symbolic.json');
      const memoryContent = await fs.readFile(memoryPath, 'utf-8');
      const parsedMemory = JSON.parse(memoryContent);
      
      if (Array.isArray(parsedMemory)) {
        // Validate each memory node
        memory = parsedMemory.filter(validateMemoryNode);
        
        // Update cache
        memoryCache.set(cacheKey, {
          data: memory,
          timestamp: Date.now()
        });
        
        return NextResponse.json(memory);
      }
    } catch (err) {
      console.error('Failed to load from memory sync file:', err);
    }
    
    // If both sources fail, return empty array
    return NextResponse.json([]);
  } catch (error) {
    console.error('Failed to load current memory:', error);
    return NextResponse.json(
      { error: 'Failed to load current memory' },
      { status: 500 }
    );
  }
} 