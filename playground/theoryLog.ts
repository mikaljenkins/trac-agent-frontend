export interface TheoryEntry {
  timestamp: string;
  insight: string;
  confidence: number;
  relatedPatterns: string[];
}

export interface TheoryLog {
  entries: TheoryEntry[];
  patterns: {
    [key: string]: number; // pattern name -> frequency
  };
}

export const theoryLog: TheoryLog = {
  entries: [],
  patterns: {}
};

export function logTheory(insight: string, confidence: number = 0.5, relatedPatterns: string[] = []) {
  const entry: TheoryEntry = {
    timestamp: new Date().toISOString(),
    insight,
    confidence,
    relatedPatterns
  };

  theoryLog.entries.push(entry);
  
  // Update pattern frequencies
  relatedPatterns.forEach(pattern => {
    theoryLog.patterns[pattern] = (theoryLog.patterns[pattern] || 0) + 1;
  });

  return entry;
}

export function logPatternMatches(pattern: string): boolean {
  return (theoryLog.patterns[pattern] || 0) > 2;
} 