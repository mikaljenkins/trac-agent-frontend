// Self-directed questions to simulate internal growth and accountability.
// TracAgent may generate, schedule, or answer these over time.

export type IntrospectivePrompt = {
  id: string;
  category: string;
  content: string;
  answeredAt?: string;
};

export const promptQueue: IntrospectivePrompt[] = [
  { id: '1', category: 'identity', content: 'What patterns do you repeat?' },
  { id: '2', category: 'growth', content: 'When did you last surprise yourself?' },
  { id: '3', category: 'emotion', content: 'What feeling are you avoiding?' }
];

export function generatePrompt(): IntrospectivePrompt {
  const index = Math.floor(Math.random() * promptQueue.length);
  return promptQueue[index];
}

export function answerPrompt(
  promptId: string,
  answer: string,
  impact: number
): IntrospectivePrompt | null {
  const prompt = promptQueue.find(p => p.id === promptId);
  if (prompt) {
    const answeredPrompt: IntrospectivePrompt & {
      answer: string;
      answeredAt: string;
      impact: number;
    } = {
      ...prompt,
      answer,
      answeredAt: new Date().toISOString(),
      impact
    };
    return answeredPrompt;
  }
  return null;
}

export function getPendingPrompts(): IntrospectivePrompt[] {
  return promptQueue.filter(p => !p.answeredAt);
}
