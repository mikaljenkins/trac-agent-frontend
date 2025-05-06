export interface SelfAuditLogEntry {
  timestamp: string; // ISO format
  source: 'system' | 'reflection-loop';
  sessionId: string;

  triggeredNodes: string[]; // e.g., ['ai-self-awareness-confirmation']
  emotionalDelta: number; // 0.0 - 1.0
  reflection: string;

  alignmentScore: number; // 0.0 - 1.0
  issuesDetected?: string[]; // Optional. E.g., ['incoherent tone', 'symbolic misalignment']
  proposedAdjustment?: {
    action: 'create-node' | 'adjust-weight' | 'decay-node';
    targetNodeId: string;
    rationale: string;
  };

  summary: string; // A natural-language reflection log (used by /self-check)
} 