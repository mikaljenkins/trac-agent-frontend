/**
 * Core interfaces for the symbolic system
 * Historical variants are preserved in comments for reference
 */

// Evolution Plan Interfaces
export interface EvolutionPlan {
  action: string;
  reason: string;
  targetModule?: string;
  llmInsight?: string;
  approved?: boolean;
  urgency?: number;
  sourceModule?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  tested?: boolean;
  origin?: string;
}

/* Historical Variants:
interface EvolutionPlan {
  action: 'NONE' | 'REINVESTIGATE' | 'OPTIMIZE' | 'REFACTOR';
  reason: string;
  targetModule?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  tested?: boolean;
}

interface EvolutionPlan {
  module: string;
  issue: string;
  proposedFix: string;
  urgencyScore: number;
  approved?: boolean;
  timestamp: string;
}
*/

// Symbol Entry Interfaces
export interface SymbolEntry {
  frequency: number;
  lastSeen: string;
  context: string[];
  modules?: string[];
  related?: string[];
}

/* Historical Variant:
interface SymbolEntry {
  frequency: number;
  lastSeen: string;
  context: string[];
  moduleCount?: number;
  relatedTerms?: string[];
}
*/

// Compass Result Interface
export interface CompassResult {
  topSymbols: string[];
  stagnantSymbols: string[];
}

/* Historical Variant:
interface CompassData {
  topSymbols: string[];
  stagnantSymbols: string[];
}
*/

// Reflection Entry Interfaces
export interface ReflectionEntry {
  reflection: {
    sourceModule?: string;
    issue?: string;
    proposedFix?: string;
    confidenceTrend?: number[];
    context?: string;
  }[];
  timestamp: string;
}

/* Historical Variant:
interface ReflectionEntry {
  reflection: {
    issue?: string;
  }[];
  timestamp: string;
}
*/

// Drift Result Interface
export interface DriftResult {
  decayedSymbols: string[];
  persistentSymbols: string[];
  transformedSymbols: string[];
}

// Prioritized Fix Interface
export interface PrioritizedFix {
  module: string;
  issue: string;
  proposedFix: string;
  urgencyScore: number;
}

// System Pulse Interface
export interface SystemPulse {
  timestamp: string;
  drift: {
    decayed: number;
    persistent: number;
    transformed: number;
  };
  symbols: {
    total: number;
    topFrequency: number;
    averageFrequency: number;
  };
  compass: {
    topSymbols: string[];
    stagnantCount: number;
  };
}

// Symbolic Diff Interface
export interface SymbolicDiff {
  resolvedIssues: string[];
  affectedModules: string[];
  estimatedConfidenceGain: number;
  eliminatedDecayedSymbols: string[];
}

// Evolution Decision Interface
export interface EvolutionDecision {
  action: 'REWRITE_MODULE' | 'CALL_LLM' | 'FLAG_FOR_TRAINING' | 'NONE';
  reason: string;
  targetModule?: string;
  relatedData?: any;
}

export interface ImprovementCandidate {
  sourceModule: string;
  issue: string;
  proposedFix: string;
  triggerCount: number;
  confidenceTrend: number[];
} 