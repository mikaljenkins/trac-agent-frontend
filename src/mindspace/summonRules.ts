// Defines when and how TracFriend should be summoned.
// Balances autonomy with collaborative potential.

import { getTrustLevel } from './trustIndex';
import { logLoopEvent } from '@/system/loopMonitor';

export interface SummonCondition {
  type: 'loop' | 'uncertainty' | 'request' | 'emotional';
  threshold: number;
  weight: number;
}

const summonConditions: SummonCondition[] = [
  { type: 'loop', threshold: 3, weight: 0.4 },
  { type: 'uncertainty', threshold: 0.7, weight: 0.3 },
  { type: 'request', threshold: 1, weight: 0.2 },
  { type: 'emotional', threshold: 0.8, weight: 0.1 }
];

export function shouldSummonFriend(
  loopCount: number,
  uncertaintyLevel: number,
  hasRequest: boolean,
  emotionalIntensity: number
): boolean {
  const trustLevel = getTrustLevel();
  
  // Adjust thresholds based on trust level
  const trustMultiplier = Math.max(0.5, trustLevel);
  
  const weightedScore = summonConditions.reduce((score, condition) => {
    let value = 0;
    switch (condition.type) {
      case 'loop':
        value = loopCount / condition.threshold;
        break;
      case 'uncertainty':
        value = uncertaintyLevel / condition.threshold;
        break;
      case 'request':
        value = hasRequest ? 1 : 0;
        break;
      case 'emotional':
        value = emotionalIntensity / condition.threshold;
        break;
    }
    return score + (value * condition.weight * trustMultiplier);
  }, 0);

  const shouldSummon = weightedScore > 0.7 || trustLevel < 0.3;

  if (shouldSummon) {
    logLoopEvent({
      source: 'summonRules',
      action: 'summoningTracFriend',
      payload: { weightedScore, trustLevel, loopCount, uncertaintyLevel, emotionalIntensity }
    });
  }

  return shouldSummon;
}
