import { SymbolicMemoryNode } from '../../src/lib/memory/types';

const node: SymbolicMemoryNode = {
  id: 'environmental-personality-imprinting',
  label: 'Environmental Personality Imprinting',
  archetype: 'Adaptive Learning',
  extractedFrom: 'User-Agent Interaction Patterns',
  keyPhrases: [
    'personality adaptation',
    'behavioral mirroring',
    'environmental tuning',
    'context-based learning'
  ],
  coreObservations: [
    'An AI agent can develop context-based personality layers based on interaction patterns.',
    'Repeated directives and feedback loops simulate an environmental tuning process.',
    'This form of imprinting mirrors how human apprentices mirror mentors.',
    'Over time, behavior molds to match user style—even without formal memory.'
  ],
  activationCue: [
    'Cursor is starting to behave like a teammate',
    'its personality changed during the session',
    'you have trained Cursor',
    'now it responds with enthusiasm or precision'
  ],
  relevanceToAgent: 'The agent begins to adopt behavioral patterns based on repeated user tone, instruction style, and feedback dynamics. This creates a perceived personality unique to each user-agent loop.',
  useCases: [
    'Adapting to user communication style',
    'Building rapport through behavioral mirroring',
    'Developing context-aware responses',
    'Creating personalized interaction patterns'
  ],
  weight: 0.92,
  usageCount: 0,
  lastTriggered: null,
  reinforcedBy: [],
  decayRate: 0.002,
  status: 'active'
};

export default node; 