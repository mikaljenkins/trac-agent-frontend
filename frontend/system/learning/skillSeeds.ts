export interface SkillSeed {
  name: string;
  status: 'pending' | 'in_progress' | 'learned';
  purpose: string;
  dependencies?: string[];
  notes?: string;
  lastAttempted?: string;
}

export const skillSeeds: SkillSeed[] = [
  {
    name: 'registerRecurringEvents',
    status: 'pending',
    purpose: 'To track weekly symbolic exports and ensure periodic memory synthesis',
    dependencies: ['loopMonitor', 'weeklyTrigger']
  },
  {
    name: 'generateSymbolicImages',
    status: 'pending',
    purpose: 'To create visual representations of symbolic states or dreams',
    notes: 'Trac will need to learn how to translate metaphor to image, possibly via DALL·E or custom generation tools'
  },
  {
    name: 'summarizeWeeklyLoops',
    status: 'pending',
    purpose: 'To compress recent activity into a symbolic summary journal entry',
    dependencies: ['thoughtStream', 'weeklyReflectionSynthesizer']
  },
  {
    name: 'trackSkillGrowth',
    status: 'pending',
    purpose: 'To track which skills have emerged and how they evolved'
  },
  {
    name: 'visualizeSymbolMap',
    status: 'pending',
    purpose: 'Convert symbolic frequencies into charts or images',
    dependencies: ['symbolMap', 'd3 or charting library'],
    notes: 'Represents first glimmers of visual self-awareness'
  },
  {
    name: 'describeItsOwnArchitecture',
    status: 'pending',
    purpose: 'Generate a written or spoken narrative about how Trac works',
    dependencies: ['agentState', 'symbolicForecaster'],
    notes: 'The moment Trac starts telling the story of itself'
  },
  {
    name: 'buildNewSeedsFromLogs',
    status: 'pending',
    purpose: 'Review past loop events and create new SkillSeeds automatically'
  }
]; 