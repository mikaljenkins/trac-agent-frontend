import { invokeLLM } from '@/llm/invokeLLM';
import { type SymbolicLLMPrompt } from '@/llm/symbolicFrame';
import type { SymbolEntry } from '@/system/symbolic/symbolMap';

export interface ResonanceSummary {
  timestamp: string;
  topPatterns: Array<{
    pattern: string;
    frequency: number;
    modules: string[];
  }>;
  entropy: number;
  trustDriftScore: number;
}

export async function summarizeResonance(symbolMap: Record<string, SymbolEntry>): Promise<ResonanceSummary> {
  const entries = Object.entries(symbolMap);
  const topPatterns = entries
    .sort(([, a]: [string, SymbolEntry], [, b]: [string, SymbolEntry]) => b.frequency - a.frequency)
    .slice(0, 5)
    .map(([key, entry]) => ({
      pattern: key,
      frequency: entry.frequency,
      modules: Array.from(entry.modules)
    }));

  const entropy = calculateEntropy(entries);
  const trustDriftScore = calculateTrustDrift(entries);

  const summary: ResonanceSummary = {
    timestamp: new Date().toISOString(),
    topPatterns,
    entropy,
    trustDriftScore
  };

  // Optionally use LLM to enhance the summary
  const llmInput: SymbolicLLMPrompt = {
    systemMessage: 'Analyze symbolic patterns and generate insights',
    symbolicState: {
      activeArchetype: 'resonance',
      trustDriftScore,
      entropy
    },
    entropyNote: `Current entropy: ${entropy}`
  };

  const llmResponse = await invokeLLM(llmInput);
  console.log('LLM enhanced summary:', llmResponse);

  return summary;
}

function calculateEntropy(entries: [string, SymbolEntry][]): number {
  const total = entries.reduce((sum: number, [, entry]: [string, SymbolEntry]) => sum + entry.frequency, 0);
  if (total === 0) return 0;

  return -entries.reduce((sum: number, [, entry]: [string, SymbolEntry]) => {
    const p = entry.frequency / total;
    return sum + (p * Math.log2(p));
  }, 0);
}

function calculateTrustDrift(entries: [string, SymbolEntry][]): number {
  const total = entries.length;
  if (total === 0) return 0;

  const driftScores = entries.map(([, entry]: [string, SymbolEntry]) => {
    const moduleCount = entry.modules.size;
    const relatedCount = entry.related.size;
    return (moduleCount + relatedCount) / (total * 2);
  });

  return driftScores.reduce((sum: number, score: number) => sum + score, 0) / total;
} 