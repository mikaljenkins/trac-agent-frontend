import { logSelfAudit, computeAlignmentScore, getRecentAuditLogs } from './self-awareness/selfAudit';
import { SelfAuditLogEntry } from './self-awareness/self-audit-log-schema';

interface ReflectionState {
  currentReflection: string;
  triggeredNodes: string[];
  emotionalDelta: number;
  source: 'system' | 'reflection-loop';
}

export class ReflectionEngine {
  private readonly ALIGNMENT_THRESHOLD = 0.65;
  private reflectionHistory: string[] = [];

  /**
   * Processes a reflection through the self-awareness loop
   */
  public async processReflection(state: ReflectionState): Promise<string> {
    // Get recent reflections for alignment scoring
    const recent = getRecentAuditLogs(3);
    const recentReflections = recent.map(log => log.reflection);
    
    // Compute alignment score
    const score = computeAlignmentScore(state.currentReflection, recentReflections);

    // Log the reflection for self-audit
    const auditEntry: SelfAuditLogEntry = {
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      reflection: state.currentReflection,
      triggeredNodes: state.triggeredNodes,
      emotionalDelta: state.emotionalDelta,
      source: state.source,
      alignmentScore: score,
      issuesDetected: score < this.ALIGNMENT_THRESHOLD ? ['low-alignment'] : [],
      summary: await this.generateReflectionSummary(state, score)
    };

    // Log to self-audit system
    logSelfAudit(auditEntry);

    // If alignment is low, inject insight
    if (score < this.ALIGNMENT_THRESHOLD) {
      return this.injectInsight(state.currentReflection);
    }

    return state.currentReflection;
  }

  /**
   * Generates a summary of the reflection for audit purposes
   */
  private async generateReflectionSummary(
    state: ReflectionState,
    alignmentScore: number
  ): Promise<string> {
    const status = alignmentScore >= this.ALIGNMENT_THRESHOLD ? 'aligned' : 'needs-attention';
    const nodeCount = state.triggeredNodes.length;
    
    return `Reflection ${status}. Triggered ${nodeCount} nodes. Emotional delta: ${state.emotionalDelta.toFixed(2)}`;
  }

  /**
   * Injects insight when alignment is low
   */
  private injectInsight(reflection: string): string {
    const insight = "I notice my reflection may be misaligned with recent context. Let me adjust...\n\n";
    return insight + reflection;
  }

  /**
   * Gets the current session ID
   * TODO: Implement proper session management
   */
  private getSessionId(): string {
    return 'session-' + Date.now();
  }

  /**
   * Clears reflection history (useful for testing)
   */
  public clearHistory(): void {
    this.reflectionHistory = [];
  }
}

// Export a factory function for creating new reflection engine instances
export function createReflectionEngine(): ReflectionEngine {
  return new ReflectionEngine();
} 