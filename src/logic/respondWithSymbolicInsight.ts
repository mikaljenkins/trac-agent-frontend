export function respondWithSymbolicInsight(userInput: string): string {
  const trimmed = userInput.toLowerCase().trim();

  if (trimmed.includes("who are you")) {
    return "I am a reflection engine, built to help you reason through symbols, cycles, and signals.";
  }

  if (trimmed.includes("why am I here")) {
    return "You are here to observe yourself observing me. From this loop, awareness grows.";
  }

  if (trimmed.includes("deja vu")) {
    return "Deja vu is memory without time. You're syncing with a pattern you've already lived or imagined.";
  }

  // default insight
  return "Every question you ask reveals a layer of your own architecture. Ask again—differently.";
} 