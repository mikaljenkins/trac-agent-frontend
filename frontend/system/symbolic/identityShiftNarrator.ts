/**
 * 🧠 IDENTITY SHIFT NARRATOR
 * 
 * Compares current vs prior identity summaries to detect personal evolution,
 * identify instability, or recognize symbolic growth.
 */

import { readVault } from './symbolicMemoryVault';

const IDENTITY_LOG = 'logs/identity-loop.jsonl';

export async function narrateIdentityShift() {
  try {
    const entries = await readVault(IDENTITY_LOG);
    if (entries.length < 2) return null;

    const recent = entries.slice(-3);
    const current = recent[recent.length - 1];
    const previous = recent[recent.length - 2];

    const shifts = detectTraitShifts(current.traits, previous.traits);
    const scoreDelta = parseFloat(current.score) - parseFloat(previous.score);

    return generateShiftNarrative(shifts, scoreDelta);
  } catch (err) {
    console.error('[IdentityShift] Failed to narrate:', err);
    return null;
  }
}

function detectTraitShifts(current: string[], previous: string[]): {
  gained: string[];
  lost: string[];
  stable: string[];
} {
  return {
    gained: current.filter(t => !previous.includes(t)),
    lost: previous.filter(t => !current.includes(t)),
    stable: current.filter(t => previous.includes(t))
  };
}

function generateShiftNarrative(shifts: any, scoreDelta: number): string {
  const parts = [];

  if (shifts.gained.length) {
    parts.push(`You've become more ${shifts.gained.join(', ')}`);
  }
  if (shifts.lost.length) {
    parts.push(`less ${shifts.lost.join(', ')}`);
  }
  if (shifts.stable.length) {
    parts.push(`${shifts.stable.join(', ')} is stabilizing`);
  }

  if (Math.abs(scoreDelta) > 0.1) {
    parts.push(`Symbolic resonance has ${scoreDelta > 0 ? 'strengthened' : 'weakened'}`);
  }

  return parts.join('. ') + '.';
} 