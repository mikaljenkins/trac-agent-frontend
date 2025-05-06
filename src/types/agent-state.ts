export interface AgentState {
  lastAgent?: string;
  lastInput?: any;
  lastResult?: any;
  timestamp?: string;
  theme?: string;
  emotionalBaseline?: number;
  trustIndex?: number;
  symbolHistory?: string[];
  reflectionQueue?: string[];
  performanceLog?: {
    timestamp: string;
    action: string;
    result: any;
  }[];
  lastDreamSymbol?: string | null;
  currentTrustScore?: number;
  currentFocusTheme?: string;
  loopCount?: number;
} 