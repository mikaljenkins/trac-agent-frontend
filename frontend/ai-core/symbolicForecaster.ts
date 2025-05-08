import { invokeLLM } from './invokeLLM';
import { SymbolicLLMPrompt } from './symbolicFrame';

export interface SymbolicForecast {
  symbol: string;
  projectedDecay: number;
  likelyDrift: boolean;
  archetypeInfluence: string[];
  forecastNarrative: string;
  confidence: number;
  timestamp: string;
}

interface ResonanceTrend {
  symbol: string;
  frequency: number;
  decayRate: number;
  lastReinforced: string;
}

interface DriftReport {
  convergenceScore: number;
  divergenceScore: number;
  dominantArchetypes: string[];
  entropyDelta: number;
}

interface AgentState {
  predictedArchetype: string;
  symbolicMemory: {
    [key: string]: {
      decayScore: number;
      reinforcementScore: number;
    };
  };
  resonanceTrends: ResonanceTrend[];
  driftReport: DriftReport;
}

export async function analyzeSymbolicTrajectory(
  symbol: string,
  agentState: AgentState
): Promise<SymbolicForecast> {
  const trend = agentState.resonanceTrends.find(t => t.symbol === symbol);
  const memory = agentState.symbolicMemory[symbol];

  if (!trend || !memory) {
    throw new Error(`No data available for symbol: ${symbol}`);
  }

  // Calculate projected decay based on current decay rate and reinforcement
  const projectedDecay = Math.max(
    0,
    Math.min(
      1,
      memory.decayScore + (trend.decayRate * (1 - memory.reinforcementScore))
    )
  );

  // Determine likelihood of drift based on convergence/divergence scores
  const likelyDrift = 
    agentState.driftReport.divergenceScore > 0.6 ||
    agentState.driftReport.convergenceScore < 0.4;

  // Identify influential archetypes
  const archetypeInfluence = [
    agentState.predictedArchetype,
    ...agentState.driftReport.dominantArchetypes
  ].filter((v, i, a) => a.indexOf(v) === i);

  // Generate forecast narrative using LLM
  const prompt: SymbolicLLMPrompt = {
    archetype: 'Oracle',
    symbolicState: JSON.stringify({
      symbol,
      currentState: {
        decay: memory.decayScore,
        reinforcement: memory.reinforcementScore,
        frequency: trend.frequency,
      },
      projectedState: {
        decay: projectedDecay,
        drift: likelyDrift,
        archetypes: archetypeInfluence,
      },
      context: {
        entropy: agentState.driftReport.entropyDelta,
        convergence: agentState.driftReport.convergenceScore,
        divergence: agentState.driftReport.divergenceScore,
      },
    }),
    entropy: agentState.driftReport.entropyDelta,
    trustDrift: agentState.driftReport.convergenceScore - agentState.driftReport.divergenceScore,
    recentInsights: [
      `Analyzing trajectory for symbol: ${symbol}`,
      `Current decay: ${memory.decayScore}`,
      `Projected decay: ${projectedDecay}`,
      `Drift likelihood: ${likelyDrift ? 'High' : 'Low'}`,
    ],
  };

  const response = await invokeLLM(prompt);

  // Calculate confidence based on data quality and stability
  const confidence = Math.max(
    0,
    Math.min(
      1,
      (1 - Math.abs(agentState.driftReport.entropyDelta)) *
      (1 - Math.abs(agentState.driftReport.convergenceScore - agentState.driftReport.divergenceScore))
    )
  );

  return {
    symbol,
    projectedDecay,
    likelyDrift,
    archetypeInfluence,
    forecastNarrative: response.text,
    confidence,
    timestamp: new Date().toISOString(),
  };
}

export async function generateSymbolicForecast(
  agentState: AgentState
): Promise<SymbolicForecast[]> {
  // Get top resonant symbols
  const topSymbols = agentState.resonanceTrends
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10)
    .map(t => t.symbol);

  // Generate forecasts for each symbol
  const forecasts = await Promise.all(
    topSymbols.map(symbol => analyzeSymbolicTrajectory(symbol, agentState))
  );

  // Sort by confidence and drift likelihood
  return forecasts.sort((a, b) => {
    if (a.likelyDrift !== b.likelyDrift) {
      return a.likelyDrift ? -1 : 1;
    }
    return b.confidence - a.confidence;
  });
} 