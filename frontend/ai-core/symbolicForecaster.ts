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
  volatilityScore: number;
  memoryEcho: boolean;
  archetypeVolatilityImpact: number;
}

export interface AgentState {
  currentArchetype: string;
  memoryState: {
    symbols: Array<{
      name: string;
      strength: number;
      lastAccessed: string;
      historicalConfidence?: Array<{
        value: number;
        timestamp: string;
      }>;
    }>;
    archetypes: Array<{
      name: string;
      influence: number;
      lastActive: string;
      transitions?: Array<{
        from: string;
        to: string;
        timestamp: string;
      }>;
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
  reflectionHistory?: Array<{
    timestamp: string;
    symbols: string[];
    archetype: string;
  }>;
}

function calculateVolatilityScore(historicalConfidence: Array<{ value: number; timestamp: string }> = []): number {
  if (historicalConfidence.length < 2) return 0;
  
  // Calculate standard deviation of confidence values
  const values = historicalConfidence.map(h => h.value);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function detectMemoryEcho(symbol: string, reflectionHistory: Array<{ symbols: string[] }> = []): boolean {
  if (reflectionHistory.length < 2) return false;
  
  // Check if symbol appears in at least 2 recent reflections
  const recentReflections = reflectionHistory.slice(-5); // Look at last 5 reflections
  const occurrences = recentReflections.filter(r => r.symbols.includes(symbol)).length;
  return occurrences >= 2;
}

function calculateArchetypeImpact(
  symbol: string,
  archetypes: Array<{
    name: string;
    transitions?: Array<{ from: string; to: string; timestamp: string }>;
  }>,
  symbolConfidence: number
): number {
  // Find archetype transitions near symbol's last access
  const relevantTransitions = archetypes.flatMap(a => 
    (a.transitions || []).filter(t => 
      Math.abs(new Date(t.timestamp).getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000 // Within 7 days
    )
  );

  if (relevantTransitions.length === 0) return 0;

  // Calculate impact based on number of transitions and confidence
  const transitionCount = relevantTransitions.length;
  const baseImpact = transitionCount * 0.1; // Each transition adds 10% impact
  return Math.min(1, baseImpact * symbolConfidence);
}

export async function generateSymbolicForecast(agentState: AgentState): Promise<SymbolicForecast[]> {
  const { memoryState, driftMetrics, reflectionHistory } = agentState;
  
  return memoryState.symbols.map(symbol => {
    // Existing calculations
    const lastAccess = new Date(symbol.lastAccessed);
    const daysSinceAccess = (Date.now() - lastAccess.getTime()) / (1000 * 60 * 60 * 24);
    const projectedDecay = Math.min(1, daysSinceAccess / 30);
    
    const driftRisk = driftMetrics.recentChanges
      .filter(change => change.symbol === symbol.name)
      .reduce((sum, change) => sum + change.magnitude, 0);
    const likelyDrift = driftRisk > 0.5;
    
    const archetypeInfluence = memoryState.archetypes
      .filter(a => a.influence > 0.3)
      .map(a => a.name);
    const confidence = Math.min(1, symbol.strength * (1 + archetypeInfluence.length * 0.2));
    
    // New metric calculations
    const volatilityScore = calculateVolatilityScore(symbol.historicalConfidence);
    const memoryEcho = detectMemoryEcho(symbol.name, reflectionHistory);
    const archetypeVolatilityImpact = calculateArchetypeImpact(
      symbol.name,
      memoryState.archetypes,
      confidence
    );
    
    // Enhanced narrative
    const forecastNarrative = [
      likelyDrift ? `Symbol shows signs of drift with ${Math.round(driftRisk * 100)}% risk` : 'Stable resonance',
      memoryEcho ? 'Persistent presence in recent reflections' : 'Emergent symbol',
      `Volatility: ${Math.round(volatilityScore * 100)}%`,
      `Archetype impact: ${Math.round(archetypeVolatilityImpact * 100)}%`,
      `Influenced by: ${archetypeInfluence.join(', ')}`,
    ].join('. ');
    
    return {
      symbol: symbol.name,
      projectedDecay,
      likelyDrift,
      confidence,
      archetypeInfluence,
      forecastNarrative,
      timestamp: new Date().toISOString(),
      volatilityScore,
      memoryEcho,
      archetypeVolatilityImpact,
    };
  });
}

export function analyzeSymbolicTrajectory(forecasts: SymbolicForecast[]): {
  dominantArchetype: string;
  driftTrend: number;
  confidenceTrend: number;
  volatilityTrend: number;
  echoRatio: number;
  archetypeImpactTrend: number;
} {
  // Existing calculations
  const archetypeCounts = forecasts.reduce((acc, f) => {
    f.archetypeInfluence.forEach(archetype => {
      acc[archetype] = (acc[archetype] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  
  const dominantArchetype = Object.entries(archetypeCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';
  
  // New trend calculations
  const driftTrend = forecasts.reduce((sum, f) => sum + (f.likelyDrift ? 1 : 0), 0) / forecasts.length;
  const confidenceTrend = forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length;
  const volatilityTrend = forecasts.reduce((sum, f) => sum + f.volatilityScore, 0) / forecasts.length;
  const echoRatio = forecasts.reduce((sum, f) => sum + (f.memoryEcho ? 1 : 0), 0) / forecasts.length;
  const archetypeImpactTrend = forecasts.reduce((sum, f) => sum + f.archetypeVolatilityImpact, 0) / forecasts.length;
  
  return {
    dominantArchetype,
    driftTrend,
    confidenceTrend,
    volatilityTrend,
    echoRatio,
    archetypeImpactTrend,
  };
} 