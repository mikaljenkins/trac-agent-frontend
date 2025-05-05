// Logs raw internal reflections TracAgent does not immediately share.
// Includes uncertainties, hypotheses, or mental doodles.

import { generatePrompt } from './introspectivePrompts';

export interface Thought {
  id: string;
  timestamp: string;
  content: string;
  type: 'uncertainty' | 'hypothesis' | 'doodle';
  confidence: number; // 0 to 1
  relatedThoughts: string[]; // IDs of related thoughts
}

const thoughtStream: Thought[] = [];

export function logThought(
  content: string,
  type: Thought['type'],
  confidence: number,
  relatedThoughts: string[] = []
): Thought {
  const thought: Thought = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    content,
    type,
    confidence,
    relatedThoughts
  };

  thoughtStream.push(thought);

  // Trigger introspective prompts based on thought characteristics
  if (type === 'uncertainty' && confidence < 0.3) {
    generatePrompt(
      `What does this uncertainty reveal about my understanding? "${content}"`,
      'insight'
    );
  } else if (type === 'hypothesis' && confidence > 0.7) {
    generatePrompt(
      `How might this hypothesis transform my perspective? "${content}"`,
      'growth'
    );
  }

  return thought;
}

export function getThoughtsByType(type: Thought['type']): Thought[] {
  return thoughtStream.filter(thought => thought.type === type);
}
