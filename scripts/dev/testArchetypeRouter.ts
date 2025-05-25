import type { AgentState } from '../../frontend/ai-core/archetypes/types';

const testStates: AgentState[] = [
  {
    loopCount: 6,
    emotionalBaseline: 0.8,
    trustIndex: 0.5,
    reasoningAlertLevel: 'high'
  } as AgentState,
  {
    loopCount: 2,
    emotionalBaseline: 0.4,
    trustIndex: 0.65,
    reasoningAlertLevel: 'medium'
  } as AgentState,
  {
    loopCount: 1,
    emotionalBaseline: 0.2,
    trustIndex: 0.2,
    reasoningAlertLevel: 'low'
  } as AgentState
];

for (const state of testStates) {
  const result = determineActiveArchetype(state);
  console.log('AgentState:', state);
  console.log('Archetype Decision:', result);
  console.log('-----------------------------');
} 