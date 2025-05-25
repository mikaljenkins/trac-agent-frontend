import type { ImprovementCandidate } from './symbolic';

/**
 * ❗ SYMBOLIC SYSTEM DIRECTIVE ❗
 *
 * This module participates in Trac's symbolic reasoning system.
 * All additions below are made for alignment integrity.
 * DO NOT replace or strip symbolic fields (e.g., timestamp, identityAlignment).
 * They serve reflective journaling and resonance tracking.
 */

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
 * Represents user input to the agent
 */
export interface AgentInput {
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Represents a logged event in the agent's memory
 */
export interface LoopEvent {
  input: AgentInput;
  result: AgentResult;
  reflection?: ImprovementCandidate[];
  stateSnapshot: AgentState;
  timestamp: string;
  trace?: string[]; 
}

/**
 * Symbolic performance and resonance metrics
 */
export interface AgentMetrics {
  trust?: number;
  loops?: number;
  reasoning?: number;
  emotional?: number;
  symbolicAlignment?: number;
  resonanceScore?: number;
  dreamCoherence?: number;
  desireClarity?: number;
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
    result?: AgentResult;
  }>;
  pendingImprovements?: ImprovementCandidate[];
  metadata: {
    startTime: string;
    interactionCount: number;
    lastReflectionTime?: string;
    identityAlignment?: number; // symbolic self-coherence metric
  };
  metrics?: AgentMetrics; // optional symbolic performance tracker
  timestamp?: string; // Supports symbolic journaling, resonance snapshots, and time-aware decisions
}

export interface AgentMetadata {
  startTime: string;
  interactionCount: number;
  lastReflectionTime?: string;
  identityAlignment?: number; // symbolic self-coherence metric
}