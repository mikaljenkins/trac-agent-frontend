// Holds TracAgent's current symbolic and emotional state
// Accessible across modules for context

export interface AgentState {
  lastDreamSymbol: string | null;
  currentTrustScore: number;
  currentFocusTheme: string;
  loopCount: number;
}

export const agentState: AgentState = {
  lastDreamSymbol: null,
  currentTrustScore: 1.0,
  currentFocusTheme: 'conscious evolution',
  loopCount: 0,
}; 