import { invokeLLM } from '@/ai-core/invokeLLM';
import { SymbolicLLMPrompt } from '@/ai-core/symbolicFrame';

export type AnalysisMode = 'stability' | 'archetype' | 'drift';

interface AnalysisResult {
  narrative: string;
  confidence: number;
  mode: AnalysisMode;
  timestamp: string;
}

export async function summarizeResonanceState(
  resonanceData: any,
  mode: AnalysisMode = 'stability'
): Promise<AnalysisResult> {
  const modeConfigs = {
    stability: {
      archetype: 'Oracle',
      prompt: 'Analyze symbolic stability trends and forecast potential shifts',
      entropyWeight: 0.6,
    },
    archetype: {
      archetype: 'Sage',
      prompt: 'Assess archetype consistency and evolution patterns',
      entropyWeight: 0.4,
    },
    drift: {
      archetype: 'Sentinel',
      prompt: 'Evaluate drift risks and convergence patterns',
      entropyWeight: 0.8,
    },
  };

  const config = modeConfigs[mode];
  const entropy = resonanceData?.symbolicEntropy ?? 0.42;
  const trustDrift = resonanceData?.trustDrift ?? 0.18;

  const prompt: SymbolicLLMPrompt = {
    archetype: config.archetype,
    symbolicState: JSON.stringify({
      ...resonanceData,
      mode,
      entropyWeight: config.entropyWeight,
    }),
    entropy,
    trustDrift,
    recentInsights: [
      config.prompt,
      `Current entropy: ${entropy}`,
      `Trust drift: ${trustDrift}`,
    ],
  };

  const response = await invokeLLM(prompt);
  
  // Calculate confidence based on entropy and drift
  const confidence = Math.max(
    0,
    Math.min(
      1,
      1 - (entropy * config.entropyWeight + Math.abs(trustDrift) * (1 - config.entropyWeight))
    )
  );

  return {
    narrative: response.text,
    confidence,
    mode,
    timestamp: new Date().toISOString(),
  };
} 