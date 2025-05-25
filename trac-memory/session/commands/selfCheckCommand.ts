import { SelfAuditLogEntry } from '../../self-awareness/self-audit-log-schema';
import { getRecentAuditLogs } from '../../self-awareness/selfAudit';

interface SelfCheckResponse {
  lastReflections: {
    timestamp: string;
    summary: string;
    alignmentScore: number;
    issues: string[];
  }[];
  lastInsightInjected?: string;
}

/**
 * Processes the /self-check command to display recent internal reasoning
 */
export async function processSelfCheckCommand(): Promise<SelfCheckResponse> {
  // Get recent audit logs
  const recentLogs = getRecentAuditLogs(5);

  // Format the response
  const lastReflections = recentLogs.map(log => ({
    timestamp: log.timestamp,
    summary: log.summary,
    alignmentScore: log.alignmentScore,
    issues: log.issuesDetected || []
  }));

  // Check for recent insight injection
  const lastInsightInjected = findLastInsightInjection(recentLogs);

  return {
    lastReflections,
    lastInsightInjected
  };
}

/**
 * Finds the most recent insight injection in the audit logs
 */
function findLastInsightInjection(logs: SelfAuditLogEntry[]): string | undefined {
  // Look for reflections that start with the insight prefix
  const insightPrefix = "I notice my reflection may be misaligned";
  
  for (const log of logs) {
    if (log.reflection.startsWith(insightPrefix)) {
      return log.reflection;
    }
  }
  
  return undefined;
}

/**
 * Command handler for /self-check
 * This is the main entry point for the command
 */
export async function handleSelfCheckCommand(): Promise<string> {
  try {
    const response = await processSelfCheckCommand();
    return JSON.stringify(response, null, 2);
  } catch (error) {
    console.error('Error processing self-check command:', error);
    return JSON.stringify({
      error: 'Failed to process self-check command',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Export a factory function for creating command handlers
export function createSelfCheckCommand() {
  return {
    command: '/self-check',
    handler: handleSelfCheckCommand
  };
} 