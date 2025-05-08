import { invokeLLM } from './invokeLLM';
import { SymbolicLLMPrompt } from './symbolicFrame';

export interface SymbolicForecast {
  symbol: string;
  projectedDecay: number;
  likelyDrift: boolean;
  confidence: number;
  archetypeInfluence: string[];
  forecastNarrative: string;
  timestamp: string;
}

export interface AgentState {
  currentArchetype: string;
  memoryState: {
    symbols: Array<{
      name: string;
      strength: number;
      lastAccessed: string;
    }>;
    archetypes: Array<{
      name: string;
      influence: number;
      lastActive: string;
    }>;
  };
  driftMetrics: {
    overallRisk: number;
    recentChanges: Array<{
      symbol: string;
      magnitude: number;
      timestamp: string;
    }>;
  };
}

export async function generateSymbolicForecast(agentState: AgentState): Promise<SymbolicForecast[]> {
  // Analyze current state
  const { memoryState, driftMetrics } = agentState;
  
  // Generate forecasts for each symbol
  return memoryState.symbols.map(symbol => {
    // Calculate decay based on last access and current strength
    const lastAccess = new Date(symbol.lastAccessed);
    const daysSinceAccess = (Date.now() - lastAccess.getTime()) / (1000 * 60 * 60 * 24);
    const projectedDecay = Math.min(1, daysSinceAccess / 30); // Max decay after 30 days
    
    // Determine drift likelihood
    const driftRisk = driftMetrics.recentChanges
      .filter(change => change.symbol === symbol.name)
      .reduce((sum, change) => sum + change.magnitude, 0);
    const likelyDrift = driftRisk > 0.5;
    
    // Calculate confidence based on symbol strength and archetype influence
    const archetypeInfluence = memoryState.archetypes
      .filter(a => a.influence > 0.3)
      .map(a => a.name);
    const confidence = Math.min(1, symbol.strength * (1 + archetypeInfluence.length * 0.2));
    
    // Generate narrative
    const forecastNarrative = likelyDrift
      ? `Symbol shows signs of drift with ${Math.round(driftRisk * 100)}% risk`
      : `Stable resonance with ${archetypeInfluence.join(', ')} influence`;
    
    return {
      symbol: symbol.name,
      projectedDecay,
      likelyDrift,
      confidence,
      archetypeInfluence,
      forecastNarrative,
      timestamp: new Date().toISOString(),
    };
  });
}

export function analyzeSymbolicTrajectory(forecasts: SymbolicForecast[]): {
  dominantArchetype: string;
  driftTrend: number;
  confidenceTrend: number;
} {
  // Calculate dominant archetype
  const archetypeCounts = forecasts.reduce((acc, f) => {
    f.archetypeInfluence.forEach(archetype => {
      acc[archetype] = (acc[archetype] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  
  const dominantArchetype = Object.entries(archetypeCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';
  
  // Calculate trends
  const driftTrend = forecasts.reduce((sum, f) => sum + (f.likelyDrift ? 1 : 0), 0) / forecasts.length;
  const confidenceTrend = forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length;
  
  return {
    dominantArchetype,
    driftTrend,
    confidenceTrend,
  };
} 