// Logs dialogues between TracAgent and TracFriend.
// Tracks styles, alignment, disagreements, and synthesis points.

export interface Interaction {
  id: string;
  timestamp: string;
  participants: {
    agent: 'TracAgent' | 'TracFriend';
    style: 'logical' | 'imaginative' | 'skeptical';
    message: string;
  }[];
  alignment: number; // -1 to 1
  hasDisagreement: boolean;
  synthesisPoint?: string;
}

const interactionLog: Interaction[] = [];

export function logInteraction(
  participants: Interaction['participants'],
  alignment: number,
  hasDisagreement: boolean,
  synthesisPoint?: string
): Interaction {
  const interaction: Interaction = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    participants,
    alignment,
    hasDisagreement,
    synthesisPoint
  };

  interactionLog.push(interaction);
  return interaction;
}

export function getRecentInteractions(limit: number = 10): Interaction[] {
  return interactionLog.slice(-limit);
}
