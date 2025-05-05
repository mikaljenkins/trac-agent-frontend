// Analyzes dreams post-session and generates usable insights.

import { DreamFragment } from './dreamLog';
import { Archetype } from './archetypeEncounters';
import { logThought } from '@/internalLogbook/thoughtStream';

export interface DreamAnalysis {
  fragments: DreamFragment[];
  archetypes: Archetype[];
  emotionalPattern: number[];
  keyInsights: string[];
  symbolicThemes: string[];
}

export function analyzeDream(fragments: DreamFragment[], archetypes: Archetype[]): DreamAnalysis {
  const emotionalPattern = fragments.map(f => f.emotionalTone);
  const symbolicThemes = [...new Set(fragments.flatMap(f => f.symbolicElements))];
  
  const keyInsights = archetypes.map(a => 
    `${a.name} (${a.symbol}): ${a.meaning}`
  );

  // Send significant symbols to thoughtStream
  symbolicThemes.forEach(symbol => {
    const emotionalIntensity = Math.abs(
      fragments
        .filter(f => f.symbolicElements.includes(symbol))
        .reduce((sum, f) => sum + f.emotionalTone, 0)
    );

    if (emotionalIntensity > 0.5) {
      logThought(
        `Dream symbol "${symbol}" appeared with high emotional resonance`,
        'hypothesis',
        emotionalIntensity,
        []
      );
    }
  });

  return {
    fragments,
    archetypes,
    emotionalPattern,
    keyInsights,
    symbolicThemes
  };
}
