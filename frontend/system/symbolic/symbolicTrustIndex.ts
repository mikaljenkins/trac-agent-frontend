/**
 * 📈 SYMBOLIC TRUST INDEX
 * 
 * Converts symbolic identity traits into measurable alignment scores.
 * Used to inform agent decision-making confidence and symbolic health checks.
 */

import { readVault } from './symbolicMemoryVault';

const IDENTITY_LOG = 'logs/identity-loop.jsonl';

export async function calculateTrustIndex() {
  try {
    const entries = await readVault(IDENTITY_LOG);
    if (!entries.length) return null;

    const recent = entries.slice(-3);
    const current = recent[recent.length - 1];
    const previous = recent[recent.length - 2];

    // Calculate trait scores based on presence and stability
    const curiosityScore = calculateTraitScore(current, previous, 'curiosity');
    const clarityScore = calculateTraitScore(current, previous, 'clarity');
    const coherenceScore = calculateTraitScore(current, previous, 'coherence');

    // Calculate resonance delta
    const resonanceDelta = parseFloat(current.score) - parseFloat(previous?.score ?? current.score);

    return {
      curiosityScore,
      clarityScore,
      coherenceScore,
      resonanceDelta: parseFloat(resonanceDelta.toFixed(2))
    };
  } catch (err) {
    console.error('[TrustIndex] Failed to calculate:', err);
    return null;
  }
}

function calculateTraitScore(current: any, previous: any, trait: string): number {
  const hasTrait = current.traits.includes(trait);
  const wasStable = previous?.traits.includes(trait);
  
  // Base score on trait presence
  let score = hasTrait ? 0.9 : 0.5;
  
  // Adjust for stability
  if (wasStable) score += 0.1;
  
  return parseFloat(score.toFixed(2));
} 