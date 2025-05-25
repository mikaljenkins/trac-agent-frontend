import { addAuditLog, clearAuditLogs, getAuditLogs } from './auditLogStore';
import { SelfAuditLogEntry } from './self-audit-log-schema';

/**
 * Logs a self-audit entry to the system
 */
export function logSelfAudit(entry: SelfAuditLogEntry): void {
  addAuditLog(entry);
  console.log('🪞 Self-Audit Log Entry:', entry);
}

/**
 * Computes an alignment score based on reflection similarity
 */
export function computeAlignmentScore(reflection: string, previousReflections: string[]): number {
  // Dummy implementation for now
  // Later: use NLP diff or semantic scoring
  const repetition = previousReflections.filter(r => r === reflection).length;
  const score = 1 - Math.min(repetition / 3, 1);
  return parseFloat(score.toFixed(2));
}

/**
 * Retrieves recent audit logs
 */
export function getRecentAuditLogs(count: number = 5): SelfAuditLogEntry[] {
  return getAuditLogs(count);
}

/**
 * Retrieves audit logs with specific issues
 */
export function getAuditLogsWithIssues(issue: string): SelfAuditLogEntry[] {
  return getAuditLogs().filter(entry => 
    entry.issuesDetected?.includes(issue)
  );
}

/**
 * Clears the audit log (useful for testing)
 */
export function clearAuditLog(): void {
  clearAuditLogs();
}

/**
 * Core self-awareness auditing system for TracAgent.
 * Tracks internal state, reflection quality, and proposes adjustments.
 */
export class SelfAudit {
  private logEntries: SelfAuditLogEntry[] = [];
  private readonly ALIGNMENT_THRESHOLD = 0.7;
  private readonly EMOTIONAL_DELTA_THRESHOLD = 0.7;

  constructor(private sessionId: string) {}

  /**
   * Records a new audit entry and processes it for insights
   */
  public async recordAudit(params: {
    triggeredNodes: string[];
    emotionalDelta: number;
    reflection: string;
    source: 'system' | 'reflection-loop';
  }): Promise<SelfAuditLogEntry> {
    const alignmentScore = await this.calculateAlignmentScore(params);
    const issuesDetected = this.detectIssues(params, alignmentScore);
    const proposedAdjustment = await this.generateAdjustment(params, alignmentScore);

    const entry: SelfAuditLogEntry = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      ...params,
      alignmentScore,
      issuesDetected,
      proposedAdjustment,
      summary: await this.generateSummary(params, alignmentScore, issuesDetected)
    };

    this.logEntries.push(entry);
    logSelfAudit(entry); // Also log to global audit log
    return entry;
  }

  private async calculateAlignmentScore(params: {
    reflection: string;
    emotionalDelta: number;
  }): Promise<number> {
    return computeAlignmentScore(params.reflection, this.getRecentReflections());
  }

  private getRecentReflections(): string[] {
    return this.logEntries.map(entry => entry.reflection);
  }

  private detectIssues(
    params: { reflection: string; emotionalDelta: number },
    alignmentScore: number
  ): string[] {
    const issues: string[] = [];

    if (alignmentScore < this.ALIGNMENT_THRESHOLD) {
      issues.push('low-alignment-score');
    }

    if (params.emotionalDelta > this.EMOTIONAL_DELTA_THRESHOLD) {
      issues.push('high-emotional-volatility');
    }

    return issues;
  }

  private async generateAdjustment(
    params: { triggeredNodes: string[]; emotionalDelta: number },
    alignmentScore: number
  ): Promise<SelfAuditLogEntry['proposedAdjustment'] | undefined> {
    if (alignmentScore < this.ALIGNMENT_THRESHOLD) {
      return {
        action: 'adjust-weight',
        targetNodeId: params.triggeredNodes[0] || 'default',
        rationale: 'Low alignment score indicates need for recalibration'
      };
    }
    return undefined;
  }

  private async generateSummary(
    params: { reflection: string },
    alignmentScore: number,
    issues: string[]
  ): Promise<string> {
    const status = alignmentScore >= this.ALIGNMENT_THRESHOLD ? 'stable' : 'needs-attention';
    const issueCount = issues.length;

    return `Self-audit ${status}. ${issueCount} issues detected. Reflection: "${params.reflection.substring(0, 100)}..."`;
  }

  public getRecentEntries(count: number = 5): SelfAuditLogEntry[] {
    return this.logEntries.slice(-count);
  }

  public getEntriesWithIssues(issue: string): SelfAuditLogEntry[] {
    return this.logEntries.filter(entry => 
      entry.issuesDetected?.includes(issue)
    );
  }

  public clearLog(): void {
    this.logEntries = [];
  }
}

// Export a factory function for creating new audit instances
export function createSelfAudit(sessionId: string): SelfAudit {
  return new SelfAudit(sessionId);
} 