import { invokeLLM } from '@/llm/invokeLLM';
import { type SymbolicLLMPrompt } from '@/llm/symbolicFrame';
import { digestDreamWithLLM } from '@/system/symbolic/digestDreamWithLLM';
import { summarizeResonance } from '@/system/symbolic/summarizeResonance';
import { detectSymbolDrift } from '@/system/symbolic/symbolDriftTracker';
import { generateSymbolMap, type SymbolEntry } from '@/system/symbolic/symbolMap';
import { runSymbolicCompass } from '@/system/symbolic/symbolicCompass';
import { runSystemPulse } from '@/system/symbolic/systemPulse';
import { serializeTrace } from '@/system/utils/traceSerializer';
import type { AgentInput, AgentResult, AgentState, LoopEvent } from '@/types/agent';
import * as fs from 'fs/promises';
import { join } from 'path';
import { logEvent } from '../../system/loopMonitor';
import { generateSymbolicForecast } from './symbolicForecaster';

interface ForecastBlock {
  timestamp: string;
  loops: LoopEvent[];
  symbols: Record<string, SymbolEntry>;
  compass: {
    topSymbols: string[];
    stagnantSymbols: string[];
  };
  drift: {
    decayedSymbols: string[];
    persistentSymbols: string[];
    transformedSymbols: string[];
  };
  resonance: {
    topPatterns: Array<{
      pattern: string;
      frequency: number;
      modules: string[];
    }>;
    entropy: number;
    trustDriftScore: number;
  };
  dream: string;
  pulse: {
    drift: {
      decayed: number;
      persistent: number;
      transformed: number;
    };
    symbols: {
      total: number;
      topFrequency: number;
      averageFrequency: number;
    };
    compass: {
      topSymbols: string[];
      stagnantCount: number;
    };
  };
}

export async function exportWeeklyForecast(): Promise<void> {
  const timestamp = new Date().toISOString();

  const mockInput: AgentInput = {
    content: 'Weekly forecast generation',
    timestamp
  };

  const mockResult: AgentResult = {
    summary: 'Generated weekly forecast',
    confidence: 0.9,
    timestamp
  };

  const mockState: AgentState = {
    sessionThread: [],
    metadata: {
      startTime: timestamp,
      interactionCount: 0
    }
  };

  const loops: LoopEvent[] = [
    {
      timestamp,
      input: mockInput,
      result: mockResult,
      trace: serializeTrace(['forecast:generation', { type: 'mock', index: 0 }]),
      stateSnapshot: mockState
    },
    {
      timestamp,
      input: mockInput,
      result: mockResult,
      trace: serializeTrace(['forecast:generation', { type: 'mock', index: 1 }]),
      stateSnapshot: mockState
    }
  ];

  // Optional: log each loop event
  await Promise.all(loops.map(loop => logEvent(loop)));

  const symbolMap = await generateSymbolMap();
  const compass = await runSymbolicCompass();
  const drift = await detectSymbolDrift();
  const resonance = await summarizeResonance(symbolMap);
  const dream = await digestDreamWithLLM();
  const pulse = await runSystemPulse();

  const forecast: ForecastBlock = {
    timestamp,
    loops,
    symbols: symbolMap,
    compass,
    drift,
    resonance,
    dream,
    pulse
  };

  const forecastPath = join(process.cwd(), 'logs', 'weekly-forecast.json');
  await fs.mkdir(join(process.cwd(), 'logs'), { recursive: true });
  await fs.writeFile(forecastPath, JSON.stringify(forecast, null, 2), 'utf-8');

  // Generate symbolic forecast
  const symbolicForecast = await generateSymbolicForecast();
  const symbolicPath = join(process.cwd(), 'logs', 'symbolic-forecast.json');
  await fs.writeFile(symbolicPath, JSON.stringify(symbolicForecast, null, 2), 'utf-8');

  // Use LLM to analyze the forecast
  const llmInput: SymbolicLLMPrompt = {
    systemMessage: 'Analyze weekly forecast and generate insights',
    symbolicState: {
      activeArchetype: 'forecast',
      trustDriftScore: resonance.trustDriftScore,
      entropy: resonance.entropy
    },
    entropyNote: `Current entropy: ${resonance.entropy}`
  };

  const llmResponse = await invokeLLM(llmInput);
  console.log('LLM enhanced forecast:', llmResponse);

  // Merge forecasts
  const mergedForecast = mergeForecasts(forecast, {
    ...symbolicForecast,
    loops: [],
    symbols: {},
    compass: { topSymbols: [], stagnantSymbols: [] },
    drift: { decayedSymbols: [], persistentSymbols: [], transformedSymbols: [] },
    resonance: { topPatterns: [], entropy: 0, trustDriftScore: 0 },
    dream: '',
    pulse: {
      drift: { decayed: 0, persistent: 0, transformed: 0 },
      symbols: { total: 0, topFrequency: 0, averageFrequency: 0 },
      compass: { topSymbols: [], stagnantCount: 0 }
    }
  });
  const mergedPath = join(process.cwd(), 'logs', 'merged-forecast.json');
  await fs.writeFile(mergedPath, JSON.stringify(mergedForecast, null, 2), 'utf-8');
}

function mergeForecasts(a: ForecastBlock, b: ForecastBlock): ForecastBlock {
  return {
    ...a,
    ...b,
    loops: [...a.loops, ...b.loops],
    symbols: { ...a.symbols, ...b.symbols },
    compass: {
      topSymbols: Array.from(new Set([...a.compass.topSymbols, ...b.compass.topSymbols])),
      stagnantSymbols: Array.from(new Set([...a.compass.stagnantSymbols, ...b.compass.stagnantSymbols]))
    },
    drift: {
      decayedSymbols: Array.from(new Set([...a.drift.decayedSymbols, ...b.drift.decayedSymbols])),
      persistentSymbols: Array.from(new Set([...a.drift.persistentSymbols, ...b.drift.persistentSymbols])),
      transformedSymbols: Array.from(new Set([...a.drift.transformedSymbols, ...b.drift.transformedSymbols]))
    },
    resonance: {
      topPatterns: [...a.resonance.topPatterns, ...b.resonance.topPatterns],
      entropy: (a.resonance.entropy + b.resonance.entropy) / 2,
      trustDriftScore: (a.resonance.trustDriftScore + b.resonance.trustDriftScore) / 2
    },
    pulse: {
      drift: {
        decayed: a.pulse.drift.decayed + b.pulse.drift.decayed,
        persistent: a.pulse.drift.persistent + b.pulse.drift.persistent,
        transformed: a.pulse.drift.transformed + b.pulse.drift.transformed
      },
      symbols: {
        total: a.pulse.symbols.total + b.pulse.symbols.total,
        topFrequency: Math.max(a.pulse.symbols.topFrequency, b.pulse.symbols.topFrequency),
        averageFrequency: (a.pulse.symbols.averageFrequency + b.pulse.symbols.averageFrequency) / 2
      },
      compass: {
        topSymbols: Array.from(new Set([...a.pulse.compass.topSymbols, ...b.pulse.compass.topSymbols])),
        stagnantCount: a.pulse.compass.stagnantCount + b.pulse.compass.stagnantCount
      }
    }
  };
} 