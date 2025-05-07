import { NextRequest, NextResponse } from 'next/server';
import { logSelfAudit } from '../../../../trac-memory/self-awareness/selfAudit';
import { SelfAuditLogEntry } from '../../../../trac-memory/self-awareness/self-audit-log-schema';
import { getAuditLogs } from '../../../../trac-memory/self-awareness/auditLogStore';

export async function POST(req: NextRequest) {
  try {
    const entries: SelfAuditLogEntry[] = await req.json();
    if (!Array.isArray(entries)) {
      return NextResponse.json({ success: false, error: 'Payload must be an array' }, { status: 400 });
    }
    entries.forEach(entry => logSelfAudit(entry));
    return NextResponse.json({ success: true, count: entries.length });
  } catch (error) {
    return NextResponse.json({ success: false, error: error?.toString() }, { status: 500 });
  }
}

export async function GET() {
  // Return all audit logs for debugging (up to 50)
  const logs = getAuditLogs(50);
  return NextResponse.json({ logs });
} 