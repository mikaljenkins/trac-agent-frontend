/**
 * Represents user input to the agent
 */
export interface AgentInput {
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Represents the result of an agent interaction
 */
export interface AgentResult {
  summary: string;
  confidence: number;
  timestamp: string;
  feedbackTag?: string;
  metadata?: Record<string, any>;
}

/**
 * Represents a logged event in the agent's memory
 */
export interface LoopEvent {
  input: AgentInput;
  result: AgentResult;
  reflection?: Array<{
    sourceModule: string;
    issue: string;
    proposedFix?: string;
    triggerCount: number;
    confidenceTrend: number[];
  }>;
  stateSnapshot: AgentState;
  timestamp: string;
  trace?: string[]; // Array of trace IDs for event tracking
}

/**
 * Represents the current state of the agent
 */
export interface AgentState {
  lastInput?: AgentInput;
  lastResult?: AgentResult;
  sessionThread: Array<{
    input: string;
    reflection: any;
  }>;
  pendingImprovements?: Array<{
    sourceModule: string;
    issue: string;
    proposedFix?: string;
    triggerCount: number;
    confidenceTrend: number[];
  }>;
  metadata: {
    startTime: string;
    interactionCount: number;
    lastReflectionTime?: string;
  };
}

/**
 * Represents a potential improvement identified during reflection
 */
export interface ImprovementCandidate {
  sourceModule?: string;
  issue?: string;
  proposedFix?: string;
  triggerCount?: number;
  confidenceTrend?: number[];
} 