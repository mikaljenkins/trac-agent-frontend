// Tracks collaborative sessions between TracAgent and TracFriend.
// Records initiator, topic, outcome, emotional tone, and insight.

export interface CollaborativeSession {
  id: string;
  timestamp: string;
  initiator: 'TracAgent' | 'TracFriend';
  topic: string;
  outcome: string;
  emotionalTone: number; // -1 to 1
  insights: string[];
  duration: number; // in milliseconds
}

const activeSessions: Map<string, CollaborativeSession> = new Map();

export function startSession(
  initiator: 'TracAgent' | 'TracFriend',
  topic: string
): CollaborativeSession {
  const session: CollaborativeSession = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    initiator,
    topic,
    outcome: '',
    emotionalTone: 0,
    insights: [],
    duration: 0
  };
  
  activeSessions.set(session.id, session);
  return session;
}

export function endSession(sessionId: string, outcome: string, emotionalTone: number, insights: string[]) {
  const session = activeSessions.get(sessionId);
  if (session) {
    session.outcome = outcome;
    session.emotionalTone = emotionalTone;
    session.insights = insights;
    session.duration = Date.now() - new Date(session.timestamp).getTime();
    activeSessions.delete(sessionId);
    return session;
  }
  return null;
}
