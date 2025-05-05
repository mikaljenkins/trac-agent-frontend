// Introduces irrational logic or impossible conditions for symbolic testing.

export interface ChaosRule {
  condition: string;
  probability: number;
  effect: string;
}

const chaosRules: ChaosRule[] = [
  {
    condition: "time_flow_reversal",
    probability: 0.3,
    effect: "Causes and effects occur in reverse order"
  },
  {
    condition: "physical_law_break",
    probability: 0.4,
    effect: "Gravity becomes optional"
  },
  {
    condition: "identity_shift",
    probability: 0.5,
    effect: "Self becomes other, other becomes self"
  }
];

export function applyChaosRule(): ChaosRule | null {
  const randomRule = chaosRules[Math.floor(Math.random() * chaosRules.length)];
  return Math.random() < randomRule.probability ? randomRule : null;
}
