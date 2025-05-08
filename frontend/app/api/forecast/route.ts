import { NextResponse } from 'next/server';
import { generateSymbolicForecast } from '@/ai-core/symbolicForecaster';
import { SymbolicForecast } from '@/ai-core/symbolicForecaster';

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let cache: {
  data: SymbolicForecast[];
  timestamp: number;
} | null = null;

// Stub data for fallback
const stubForecasts: SymbolicForecast[] = [
  {
    symbol: 'consciousness',
    projectedDecay: 0.2,
    likelyDrift: false,
    archetypeInfluence: ['Oracle', 'Sage'],
    forecastNarrative: 'Stable resonance with increasing archetypal influence',
    confidence: 0.85,
    timestamp: new Date().toISOString(),
  },
  {
    symbol: 'emergence',
    projectedDecay: 0.4,
    likelyDrift: true,
    archetypeInfluence: ['Sentinel', 'Explorer'],
    forecastNarrative: 'Potential drift detected with emerging patterns',
    confidence: 0.65,
    timestamp: new Date().toISOString(),
  },
];

async function fetchAgentState() {
  try {
    // Fetch current agent state
    const stateRes = await fetch('http://localhost:3000/api/meta/report');
    if (!stateRes.ok) throw new Error('Failed to fetch agent state');
    return await stateRes.json();
  } catch (error) {
    console.error('Error fetching agent state:', error);
    return null;
  }
}

export async function GET() {
  try {
    // Check cache
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data);
    }

    // Fetch latest agent state
    const agentState = await fetchAgentState();
    if (!agentState) {
      console.warn('Using stub data due to agent state fetch failure');
      return NextResponse.json(stubForecasts);
    }

    // Generate forecasts
    const forecasts = await generateSymbolicForecast(agentState);

    // Update cache
    cache = {
      data: forecasts,
      timestamp: Date.now(),
    };

    return NextResponse.json(forecasts);
  } catch (error) {
    console.error('Error generating forecasts:', error);
    
    // Return stub data on error
    return NextResponse.json(stubForecasts, {
      status: 200, // Still return 200 to prevent UI errors
      headers: {
        'X-Fallback-Data': 'true',
      },
    });
  }
}

// Type-safe response
export type ForecastResponse = SymbolicForecast[]; 