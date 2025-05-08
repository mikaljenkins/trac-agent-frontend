'use client'

import { useState, useEffect } from 'react';
import { SymbolicForecast } from '@/ai-core/symbolicForecaster';
import { Line } from 'react-chartjs-2';

interface ForecastFilters {
  minConfidence: number;
  selectedArchetypes: string[];
  searchQuery: string;
  sortBy: 'confidence' | 'decay' | 'drift';
}

function SymbolForecastCard({ forecast }: { forecast: SymbolicForecast }) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return 'bg-blue-500';
    if (confidence >= 0.4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold">{forecast.symbol}</h3>
        <div className="flex items-center space-x-2">
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getConfidenceColor(forecast.confidence)}`}
              style={{ width: `${forecast.confidence * 100}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">
            {Math.round(forecast.confidence * 100)}%
          </span>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
          <span>Projected Decay</span>
          <span>{Math.round(forecast.projectedDecay * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500"
            style={{ width: `${forecast.projectedDecay * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {forecast.archetypeInfluence.map(archetype => (
          <span
            key={archetype}
            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
          >
            {archetype}
          </span>
        ))}
      </div>

      <p className="text-sm text-gray-700">{forecast.forecastNarrative}</p>

      {forecast.likelyDrift && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          ⚠️ High drift risk detected
        </div>
      )}
    </div>
  );
}

export default function ForecastPage() {
  const [forecasts, setForecasts] = useState<SymbolicForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ForecastFilters>({
    minConfidence: 0.4,
    selectedArchetypes: [],
    searchQuery: '',
    sortBy: 'confidence',
  });

  useEffect(() => {
    const fetchForecasts = async () => {
      try {
        const res = await fetch('/api/forecast');
        const data = await res.json();
        setForecasts(data);
      } catch (err) {
        console.error('Failed to fetch forecasts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchForecasts();
  }, []);

  // Filter and sort forecasts
  const filteredForecasts = forecasts
    .filter(forecast => {
      if (forecast.confidence < filters.minConfidence) return false;
      if (filters.searchQuery && !forecast.symbol.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
      if (filters.selectedArchetypes.length > 0 && !forecast.archetypeInfluence.some(a => filters.selectedArchetypes.includes(a))) return false;
      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'confidence':
          return b.confidence - a.confidence;
        case 'decay':
          return b.projectedDecay - a.projectedDecay;
        case 'drift':
          return a.likelyDrift === b.likelyDrift ? 0 : a.likelyDrift ? -1 : 1;
        default:
          return 0;
      }
    });

  // Calculate summary metrics
  const totalSymbols = forecasts.length;
  const avgConfidence = forecasts.reduce((sum, f) => sum + f.confidence, 0) / totalSymbols;
  const topArchetype = forecasts
    .flatMap(f => f.archetypeInfluence)
    .reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  const dominantArchetype = Object.entries(topArchetype)
    .sort(([, a], [, b]) => b - a)[0]?.[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Summary Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Symbols</h3>
            <p className="text-2xl font-bold">{totalSymbols}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Average Confidence</h3>
            <p className="text-2xl font-bold">{Math.round(avgConfidence * 100)}%</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Dominant Archetype</h3>
            <p className="text-2xl font-bold">{dominantArchetype || 'None'}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Confidence
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={filters.minConfidence}
              onChange={(e) => setFilters(f => ({ ...f, minConfidence: parseFloat(e.target.value) }))}
              className="w-full"
            />
            <span className="text-sm text-gray-500">
              {Math.round(filters.minConfidence * 100)}%
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value as ForecastFilters['sortBy'] }))}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="confidence">Confidence</option>
              <option value="decay">Decay</option>
              <option value="drift">Drift Risk</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Symbols
            </label>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters(f => ({ ...f, searchQuery: e.target.value }))}
              placeholder="Search symbols..."
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Archetype Filter
            </label>
            <select
              multiple
              value={filters.selectedArchetypes}
              onChange={(e) => setFilters(f => ({
                ...f,
                selectedArchetypes: Array.from(e.target.selectedOptions, option => option.value)
              }))}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {Array.from(new Set(forecasts.flatMap(f => f.archetypeInfluence))).map(archetype => (
                <option key={archetype} value={archetype}>
                  {archetype}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Forecast Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredForecasts.map(forecast => (
          <SymbolForecastCard key={forecast.symbol} forecast={forecast} />
        ))}
      </div>
    </div>
  );
} 