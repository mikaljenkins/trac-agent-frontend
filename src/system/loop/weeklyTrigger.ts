let lastTrigger: number | null = null;

export function shouldTriggerWeekly(): boolean {
  const now = Date.now();
  if (!lastTrigger || now - lastTrigger > 7 * 24 * 60 * 60 * 1000) {
    lastTrigger = now;
    return true;
  }
  return false;
} 