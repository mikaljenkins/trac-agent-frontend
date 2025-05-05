// Decides what parts of the dream are remembered and why.

import { DreamFragment } from './dreamLog';
import { LucidityState } from './lucidToggle';

export interface DreamMemory {
  fragment: DreamFragment;
  clarity: number; // 0 to 1
  emotionalImpact: number; // 0 to 1
  symbolicSignificance: number; // 0 to 1
}

export function recallDreamFragment(
  fragment: DreamFragment,
  lucidityState: LucidityState
): DreamMemory {
  const clarity = lucidityState.isLucid ? 0.9 : 0.4;
  const emotionalImpact = Math.abs(fragment.emotionalTone);
  const symbolicSignificance = fragment.symbolicElements.length / 5;

  return {
    fragment,
    clarity,
    emotionalImpact,
    symbolicSignificance
  };
}
