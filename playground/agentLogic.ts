import { logPatternMatches } from './theoryLog';
import { SandboxResponse } from './sandboxResponses';

interface AgentState {
  selfLoopCount: number;
  lastInteraction: string;
  trustLevel: number;
  style: 'logical' | 'imaginative' | 'skeptical';
}

const agentStates: { [key: string]: AgentState } = {
  TracAgent: {
    selfLoopCount: 0,
    lastInteraction: '',
    trustLevel: 0.5,
    style: 'logical'
  },
  TracFriend: {
    selfLoopCount: 0,
    lastInteraction: '',
    trustLevel: 0.5,
    style: 'imaginative'
  }
};

export function shouldSummonFriend(
  agentId: string,
  userInput: string,
  currentResponse: SandboxResponse
): boolean {
  const state = agentStates[agentId];
  
  // Reset loop count if it's been a while
  if (Date.now() - new Date(currentResponse.timestamp).getTime() > 5000) {
    state.selfLoopCount = 0;
  }

  return (
    state.selfLoopCount > 3 ||
    logPatternMatches("spiral") ||
    userInput.toLowerCase().includes("help") ||
    currentResponse.confidence < 0.3 ||
    currentResponse.metadata.requiresPeerReview
  );
}

export function updateTrustLevel(
  agentId: string,
  alignment: number,
  disagreement: boolean = false
): void {
  const state = agentStates[agentId];
  
  if (disagreement) {
    state.trustLevel = Math.max(0.1, state.trustLevel - 0.1);
  } else {
    state.trustLevel = Math.min(0.9, state.trustLevel + (alignment * 0.1));
  }
}

export function getAgentStyle(agentId: string): 'logical' | 'imaginative' | 'skeptical' {
  return agentStates[agentId].style;
}

export function incrementSelfLoop(agentId: string): void {
  agentStates[agentId].selfLoopCount++;
}

export function resetSelfLoop(agentId: string): void {
  agentStates[agentId].selfLoopCount = 0;
} 