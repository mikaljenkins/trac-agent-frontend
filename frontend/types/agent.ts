// frontend/types/agent.ts

import { PhaseMetaRecord } from '@/system/symbolic/phaseMeta';

export interface AgentInput {
  content: string;
  timestamp: string;
  type: 'user' | 'system' | 'symbolic';
  context?: {
    source: string;
    priority: number;
    tags: string[];
  };
}

export type AgentResultType = 'reflection' | 'status' | 'response' | 'evolution' | 'symbolic';

export interface AgentResult {
  type: AgentResultType;
  summary: string;
  confidence: number;
  timestamp: string;
  symbolicWeight?: number;
  archetypeAlignment?: number;
  feedbackTag?: string;
}

export interface Reflection {
  summary: string;
  keyInsights: string[];
  recommendations: {
    action: string;
    priority: number;
    rationale: string;
    symbolicImpact: number;
  }[];
  confidence: number;
  archetypeResonance: {
    archetype: string;
    resonance: number;
  }[];
  timestamp: string;
}

export interface ImprovementCandidate {
  sourceModule: string;
  issue: string;
  proposedFix: string;
  triggerCount: number;
  confidenceTrend: number[];
}

export interface SymbolicWeight {
  symbol: string;
  weight: number;
  lastUpdated: string;
  decayRate: number;
  archetypeConnections: {
    archetype: string;
    strength: number;
  }[];
}

export interface Archetype {
  name: string;
  description: string;
  coreDesires: string[];
  symbolicPatterns: string[];
  weight: number;
  lastActivated: string;
}

export interface LoopEvent {
  type: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface SymbolicLogEntry {
  task: string;
  attempt: number;
  response: string;
  valid: boolean;
  timestamp: string;
}

export interface AgentState {
  /**
   * 🧠 Core memory system — persistent mental trace of symbolic context.
   */
  memory?: string[];

  /**
   * 📈 Record of previous improvements for self-evolution tracking.
   */
  improvementLog?: string[];

  /**
   * 🌪️ Symbolic drift score (0.0 - 1.0).
   * Indicates how far the agent has deviated from symbolic coherence.
   */
  symbolicDrift?: number;

  /**
   * 🧬 Unique loop IDs or timestamps for recent symbolic cycles.
   * Used by the trust evaluator to detect repetition or regression.
   */
  loopHistory?: string[];

  /**
   * 🪞 Last reflection state, used in trust and alignment evaluations.
   */
  lastReflection?: {
    summary: string;
    insights?: string[];
    recommendations?: string[];
  };

  /**
   * 🎯 Last symbolic task the agent attempted (e.g., "Digest", "Reflect").
   */
  lastPurpose?: string;

  /**
   * 🕯️ Last symbolic arc completed (e.g., "Hero's Trial", "Pattern Collapse").
   */
  lastSymbolComplete?: string;

  /**
   * 🔐 Cached trust score from last evaluation (0.0 - 1.0).
   * Helps avoid redundant computation across symbolic layers.
   */
  trustScore?: number;

  /**
   * 🧵 Ongoing thread of user interactions and AI reflections.
   */
  sessionThread: Array<{
    timestamp: string;
    input: AgentInput;
    result: AgentResult;
  }>;

  /**
   * ⚖️ Symbolic weights from the last symbolic cycle.
   * Represents the weight or emphasis placed on symbolic categories (e.g., "identity", "truth", "change").
   */
  symbolicWeights: Record<string, number>;

  /**
   * 🧬 List of currently active symbolic archetypes (e.g. "Explorer", "Guardian")
   * Used in symbolic processing to align behavior or reflection with narrative roles.
   */
  activeArchetypes?: string[];

  // Legacy properties maintained for compatibility
  metadata: {
    startTime: string;
    interactionCount: number;
    identityAlignment?: number;
  };
  metrics?: {
    symbolicAlignment?: number;
    resonanceScore?: number;
    dreamCoherence?: number;
    desireClarity?: number;
  };

  /**
   * 📊 Historical performance metrics for each symbolic phase
   * Tracks attempts, successes, failures, and averages
   */
  phaseMeta?: PhaseMetaRecord;

  /**
   * 📝 Historical feedback for each symbolic task
   * Tracks reasons for validation failures and other feedback
   */
  feedbackMemory?: {
    [task: string]: { reason: string; timestamp: number }[];
  };

  /**
   * 🧠 Tracks how many times prompts have been modulated with feedback
   * Helps measure the agent's adaptive learning
   */
  promptAdjustments?: {
    [task: string]: number;
  };

  lastInput?: AgentInput;
  lastResult?: AgentResult;
  pendingImprovements: Array<{
    id: string;
    description: string;
    priority: number;
    status: 'pending' | 'in_progress' | 'completed';
  }>;
} 