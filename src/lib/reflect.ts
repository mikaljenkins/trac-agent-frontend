import { getSessionMemory } from './agentState';

export function generateReflection(): string {
  const memory = getSessionMemory();

  if (memory.length === 0) {
    return "There is no reflection yet. Nothing has been said.";
  }

  const wordCountMap: Record<string, number> = {};

  for (const entry of memory) {
    const words = entry.user
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/);
    for (const word of words) {
      if (word.length > 2) {
        wordCountMap[word] = (wordCountMap[word] || 0) + 1;
      }
    }
  }

  const frequent = Object.entries(wordCountMap)
    .filter(([, count]) => count > 1)
    .map(([word, count]) => `"${word}" (${count}x)`);

  if (frequent.length === 0) {
    return "You're exploring new thoughts. Nothing is repeating — yet.";
  }

  return `🔁 Themes are starting to emerge: ${frequent.join(', ')}.`;
} 