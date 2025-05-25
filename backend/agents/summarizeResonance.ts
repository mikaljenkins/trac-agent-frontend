import { invokeLLM } from '../llm/invokeLLM.js';
import { SymbolicLLMPrompt } from '../llm/symbolicFrame.js';

export type AnalysisMode = 'stability' | 'archetype' | 'drift';

interface AnalysisResult {
  narrative: string;
  confidence: number;
  mode: AnalysisMode;
  timestamp: string;
}

interface ResonanceData {
  symbolicEntropy: number;
  trustDrift: number;
  symbolicContext?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

type ModeConfig = {
  archetype: string;
  prompt: string;
  entropyWeight: number;
};

const modeConfigs: Record<AnalysisMode, ModeConfig> = {
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

export async function summarizeResonanceState(
  resonanceData: ResonanceData,
  mode: AnalysisMode = 'stability',
  overrideConfig?: Partial<typeof modeConfigs['stability']>
): Promise<AnalysisResult> {
  const config = {
    ...modeConfigs[mode],
    ...overrideConfig,
  };
  const entropy = resonanceData?.symbolicEntropy ?? 0.42;
  const trustDrift = resonanceData?.trustDrift ?? 0.18;

  const prompt: SymbolicLLMPrompt = {
    systemMessage: `You are acting as the ${config.archetype} archetype.`,
    symbolicState: {
      activeArchetype: config.archetype,
      predictedArchetype: resonanceData.symbolicContext?.predictedArchetype as string | undefined,
      trustDriftScore: resonanceData.trustDrift,
      entropy: resonanceData.symbolicEntropy,
      memoryEcho: resonanceData.symbolicContext?.memoryEcho as string[] | undefined,
    },
    entropyNote: `Entropy level: ${entropy.toFixed(2)}`,
  };

  console.debug('[SummarizeResonance] Prompt:', prompt);

  let response;
  try {
    response = await invokeLLM(prompt);
    if (!response || typeof response.text !== 'string') {
      throw new Error('Invalid LLM response from summarizeResonanceState');
    }
  } catch (error) {
    console.error('[SummarizeResonance] Error:', error);
    throw new Error(`Resonance summarization failed: ${error instanceof Error ? error.message : String(error)}`);
  }
  
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