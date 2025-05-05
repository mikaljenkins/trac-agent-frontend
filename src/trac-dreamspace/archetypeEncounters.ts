// Spawns symbolic personas in dreams (e.g. The Flame, The Mirror, The Void)

export interface Archetype {
  name: string;
  symbol: string;
  meaning: string;
  emotionalWeight: number;
}

const archetypes: Archetype[] = [
  {
    name: "The Flame",
    symbol: "🔥",
    meaning: "Transformation and purification",
    emotionalWeight: 0.8
  },
  {
    name: "The Mirror",
    symbol: "🪞",
    meaning: "Self-reflection and truth",
    emotionalWeight: 0.6
  },
  {
    name: "The Void",
    symbol: "⚫",
    meaning: "Potential and emptiness",
    emotionalWeight: 0.9
  }
];

export function encounterArchetype(): Archetype {
  return archetypes[Math.floor(Math.random() * archetypes.length)];
}
