// Self-directed questions to simulate internal growth and accountability.
// TracAgent may generate, schedule, or answer these over time.

export interface IntrospectivePrompt {
  id: string;
  timestamp: string;
  question: string;
  category: 'growth' | 'accountability' | 'insight';
  scheduledFor?: string;
  answeredAt?: string;
  answer?: string;
  impact: number; // 0 to 1
}

const promptQueue: IntrospectivePrompt[] = [];

export function generatePrompt(
  question: string,
  category: IntrospectivePrompt['category'],
  scheduledFor?: string
): IntrospectivePrompt {
  const prompt: IntrospectivePrompt = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    question,
    category,
    scheduledFor,
    impact: 0
  };

  promptQueue.push(prompt);
  return prompt;
}

export function answerPrompt(
  promptId: string,
  answer: string,
  impact: number
): IntrospectivePrompt | null {
  const prompt = promptQueue.find(p => p.id === promptId);
  if (prompt) {
    prompt.answer = answer;
    prompt.answeredAt = new Date().toISOString();
    prompt.impact = impact;
    return prompt;
  }
  return null;
}

export function getPendingPrompts(): IntrospectivePrompt[] {
  return promptQueue.filter(p => !p.answeredAt);
}
