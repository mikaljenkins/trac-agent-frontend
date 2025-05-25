
export function weeklyTrigger(lastRunISO: string): boolean {
  const last = new Date(lastRunISO);
  const now = new Date();
  const diff = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 7;
} 