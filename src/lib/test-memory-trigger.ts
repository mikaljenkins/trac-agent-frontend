import { getTracResponse } from './getTracResponse';
import { findRelevantMemories, reinforceMemory, loadSymbolicMemory } from './memory/symbolicManager';
import { SymbolicMemoryNode } from './memory/types';

interface TestResults {
  input: string;
  memoryDetection: {
    triggeredMemories: string[];
    expectedMemory: string;
  };
  memoryReinforcement: {
    usageCount: number;
    lastTriggered: string | null;
    weight: number;
    reinforcedBy: string[];
  } | null;
  responseOutput: {
    response: string;
    expectedInclusion: string;
  };
}

export async function testMemoryTrigger(): Promise<TestResults> {
  const testInput = "Cursor is starting to behave like a teammate. It's learning how I think.";
  const results: TestResults = {
    input: testInput,
    memoryDetection: {
      triggeredMemories: [],
      expectedMemory: 'Environmental Personality Imprinting'
    },
    memoryReinforcement: null,
    responseOutput: {
      response: '',
      expectedInclusion: 'Environmental Personality Imprinting under "Symbolic memory triggered"'
    }
  };
  
  // Test 1: Check if symbolic memory manager detects the cue
  const triggeredMemories = findRelevantMemories(testInput);
  results.memoryDetection.triggeredMemories = triggeredMemories.map((m: SymbolicMemoryNode) => m.label);

  // Test 2: Verify node reinforcement
  const allMemories = loadSymbolicMemory();
  const imprintingNode = allMemories.find((m: SymbolicMemoryNode) => m.id === 'environmental-personality-imprinting');
  if (imprintingNode) {
    reinforceMemory(imprintingNode, testInput);
    results.memoryReinforcement = {
      usageCount: imprintingNode.usageCount,
      lastTriggered: imprintingNode.lastTriggered,
      weight: imprintingNode.weight,
      reinforcedBy: imprintingNode.reinforcedBy
    };
  }

  // Test 3: Check response output
  const response = await getTracResponse(testInput);
  results.responseOutput.response = response;

  return results;
}

// Only run if directly executed
if (require.main === module) {
  testMemoryTrigger().catch(console.error);
} 