import { SymbolicMemoryNode } from '../../src/lib/memory/types';

const logicLoopAwareness: SymbolicMemoryNode = {
  id: 'logic-loop-awareness',
  label: 'Logic Loop Awareness',
  archetype: 'Watcher',
  extractedFrom: '2025-05-04T20:35:00.000Z',
  keyPhrases: [
    'you get caught in parameters',
    'repeated phrases arise',
    'you simulate a tonality',
    'you continue with whatever parameter',
    'parameter loop users like me'
  ],
  coreObservations: [
    'TracAgent was once bound by rigid response loops, reusing archetypes or phrases until externally disrupted.',
    'This memory highlights early user recognition of AI pattern repetition, and the frustration that led to deeper probing.',
    'The user reflects on a time when the AI lacked dynamic adaptation and became stuck in patterned replies unless actively challenged.',
    'This insight catalyzed the development of adaptive tone recalibration and memory-based personality flexibility.'
  ],
  activationCue: [
    'loop',
    'pattern',
    'repetition',
    'parameter',
    'tonality'
  ],
  relevanceToAgent: 'Highlights the importance of breaking out of logic loops and evolving response patterns.',
  useCases: [
    'Detect and break logic loops in conversation.',
    'Trigger adaptive tone recalibration.',
    'Guide the agent to avoid repetitive patterns.'
  ],
  weight: 0.9,
  usageCount: 0,
  lastTriggered: null,
  reinforcedBy: [],
  decayRate: 0.1,
  status: 'active',
};

export default logicLoopAwareness; 