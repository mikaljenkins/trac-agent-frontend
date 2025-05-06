import { SelfAuditLogEntry } from '../../trac-memory/self-awareness/self-audit-log-schema';

const sessionId = 'dev-session-001';
const now = new Date();

const entries: SelfAuditLogEntry[] = [
  {
    timestamp: now.toISOString(),
    source: 'reflection-loop',
    sessionId,
    triggeredNodes: ['emotional-calibration'],
    emotionalDelta: 0.12,
    reflection: 'Detected pattern alignment with emotional calibration',
    alignmentScore: 0.87,
    issuesDetected: [],
    summary: 'Pattern alignment detected. No issues.',
  },
  {
    timestamp: '2025-05-05T22:12:00Z',
    source: 'reflection-loop',
    sessionId,
    triggeredNodes: ['tone-divergence'],
    emotionalDelta: 0.33,
    reflection: 'Reflection mismatch – tone divergence noted',
    alignmentScore: 0.41,
    issuesDetected: ['emotional drift'],
    summary: 'Tone divergence noted. Emotional drift detected.',
    proposedAdjustment: {
      action: 'adjust-weight',
      targetNodeId: 'tone-divergence',
      rationale: 'Detected emotional drift, needs recalibration.'
    }
  },
  {
    timestamp: new Date(now.getTime() - 1000 * 60 * 10).toISOString(),
    source: 'system',
    sessionId,
    triggeredNodes: ['coherence-check'],
    emotionalDelta: 0.05,
    reflection: 'System check: coherence maintained',
    alignmentScore: 0.92,
    issuesDetected: [],
    summary: 'System coherence stable. No issues.'
  },
  {
    timestamp: new Date(now.getTime() - 1000 * 60 * 20).toISOString(),
    source: 'reflection-loop',
    sessionId,
    triggeredNodes: ['context-shift'],
    emotionalDelta: 0.48,
    reflection: 'Context shift detected, monitoring for instability',
    alignmentScore: 0.53,
    issuesDetected: ['context instability'],
    summary: 'Context shift detected. Monitoring required.'
  },
  {
    timestamp: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
    source: 'reflection-loop',
    sessionId,
    triggeredNodes: ['low-alignment'],
    emotionalDelta: 0.77,
    reflection: 'Critical misalignment: symbolic and emotional axes diverged',
    alignmentScore: 0.22,
    issuesDetected: ['critical misalignment'],
    summary: 'Critical misalignment detected. Immediate intervention required.',
    proposedAdjustment: {
      action: 'adjust-weight',
      targetNodeId: 'low-alignment',
      rationale: 'Critical misalignment, urgent recalibration.'
    }
  }
];

async function seedAuditLog() {
  try {
    const res = await fetch('http://localhost:3000/api/seed-audit-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entries),
    });
    const data: any = await res.json();
    if (res.ok && data.success) {
      console.log(`✅ Seeded ${data.count} audit log entries successfully.`);
    } else {
      console.error('❌ Failed to seed audit log:', data.error || data);
    }
  } catch (err) {
    console.error('❌ Error seeding audit log:', err);
  }
}

seedAuditLog(); 