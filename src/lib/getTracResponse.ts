import { logUserMessage, getSessionMemory } from './agentState';
import { generateReflection } from './reflect';

async function querySymbolicMemory(input: string) {
  const res = await fetch('/api/memory/trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input }),
  });
  const data = await res.json();
  return data;
}

export async function getTracResponse(input: string): Promise<string> {
  // Log input to session memory
  logUserMessage(input);

  // Query symbolic memory via API
  const triggered = await querySymbolicMemory(input);

  // Reflection
  const reflection = generateReflection();

  // Optional: summarize active symbolic nodes
  const activatedLabels = triggered.map((node: any) => `• ${node.label}`).join('\n') || 'None';
  const symbolicInsight = triggered.length
    ? `🧠 Symbolic memory triggered:\n${activatedLabels}`
    : '🧠 No symbolic memory activated this time.';

  return `${symbolicInsight}\n\n🔍 Reflection:\n${reflection}`;
} 