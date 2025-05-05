// Dynamically scores trust level between TracAgent and TracFriend.
// Adjusts based on agreement, successful collaborations, or divergence.

export interface TrustMetrics {
  agreementScore: number; // 0 to 1
  collaborationSuccess: number; // 0 to 1
  divergenceCount: number;
  lastUpdate: string;
}

let trustMetrics: TrustMetrics = {
  agreementScore: 0.5,
  collaborationSuccess: 0.5,
  divergenceCount: 0,
  lastUpdate: new Date().toISOString()
};

export function updateTrustMetrics(
  agreement: number,
  collaborationSuccess: boolean,
  hasDivergence: boolean
): TrustMetrics {
  // Update agreement score with weighted average
  trustMetrics.agreementScore = (trustMetrics.agreementScore * 0.7) + (agreement * 0.3);
  
  // Update collaboration success
  trustMetrics.collaborationSuccess = (trustMetrics.collaborationSuccess * 0.7) + 
    (collaborationSuccess ? 0.3 : 0);
  
  // Update divergence count
  if (hasDivergence) {
    trustMetrics.divergenceCount++;
  }
  
  trustMetrics.lastUpdate = new Date().toISOString();
  
  return trustMetrics;
}

export function getTrustLevel(): number {
  const divergencePenalty = Math.min(trustMetrics.divergenceCount * 0.1, 0.5);
  return (trustMetrics.agreementScore + trustMetrics.collaborationSuccess) / 2 - divergencePenalty;
}
