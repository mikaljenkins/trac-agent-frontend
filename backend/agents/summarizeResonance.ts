import { invokeLLM } from '@/ai-core/invokeLLM';
import { SymbolicLLMPrompt } from '@/ai-core/symbolicFrame';

export async function summarizeResonanceState(resonanceData: any) {
  const prompt: SymbolicLLMPrompt = {
    archetype: 'Oracle',
    symbolicState: JSON.stringify(resonanceData),
    entropy: resonanceData?.symbolicEntropy ?? 0.42,
    trustDrift: 0.18,
    recentInsights: ['Summary requested of resonance trends'],
  };

  const response = await invokeLLM(prompt);
  return response.text;
} 