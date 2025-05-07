import { AgentState } from '@/system/agentState';

interface ClassificationContext {
  type: 'symbolic' | 'reflective' | 'performative' | 'idle';
  payload: any;
}

export function classifyInput(input: any, agentState: AgentState): ClassificationContext {
  // Default to idle if no input
  if (!input) {
    return {
      type: 'idle',
      payload: null
    };
  }

  // Check for explicit type override
  if (input.type && ['symbolic', 'reflective', 'performative', 'idle'].includes(input.type)) {
    return {
      type: input.type,
      payload: input.payload || input
    };
  }

  // Classify based on content patterns
  if (typeof input === 'string') {
    if (input.includes('dream') || input.includes('symbol') || input.includes('pattern')) {
      return {
        type: 'symbolic',
        payload: input
      };
    }
    
    if (input.includes('reflect') || input.includes('think') || input.includes('consider')) {
      return {
        type: 'reflective',
        payload: input
      };
    }
    
    if (input.includes('perform') || input.includes('act') || input.includes('do')) {
      return {
        type: 'performative',
        payload: input
      };
    }
  }

  // Default to symbolic for unclassified input
  return {
    type: 'symbolic',
    payload: input
  };
} 