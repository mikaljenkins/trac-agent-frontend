'use client'

import { useState, useEffect } from 'react';
import { SymbolicForecast } from '@/ai-core/symbolicForecaster';
import { saveAs } from 'file-saver';

interface ForecastMetadata {
  timestamp: string;
  totalSymbols: number;
  averageConfidence: number;
  dominantArchetype: string;
  topSymbols: Array<{
    symbol: string;
    confidence: number;
  }>;
  driftPredictions: Array<{
    symbol: string;
    likelihood: number;
  }>;
}

interface ForecastExport {
  timestamp: string;
  forecasts: SymbolicForecast[];
  metadata: ForecastMetadata;
}

function ForecastCard({ forecast }: { forecast: ForecastExport }) {
  const date = new Date(forecast.timestamp).toLocaleDateString();
  const { metadata } = forecast;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{date}</h3>
          <p className="text-sm text-gray-500">
            {metadata.totalSymbols} symbols • {Math.round(metadata.averageConfidence * 100)}% avg confidence
          </p>
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {metadata.dominantArchetype}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Top Symbols</h4>
          <div className="space-y-2">
            {metadata.topSymbols.map(({ symbol, confidence }) => (
              <div key={symbol} className="flex items-center">
                <div className="w-24 text-sm truncate">{symbol}</div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
                <div className="w-12 text-right text-sm text-gray-600">
                  {Math.round(confidence * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {metadata.driftPredictions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Drift Risks</h4>
            <div className="space-y-1">
              {metadata.driftPredictions.map(({ symbol, likelihood }) => (
                <div key={symbol} className="flex items-center text-sm">
                  <span className="text-red-600 mr-2">⚠️</span>
                  <span className="flex-1">{symbol}</span>
                  <span className="text-gray-600">{Math.round(likelihood * 100)}% risk</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <a
            href={`/api/forecast/${date}`}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Raw
          </a>
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(forecast, null, 2)], {
                type: 'application/json',
              });
              saveAs(blob, `forecast-${date}.json`);
            }}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ForecastViewer() {
  const [forecasts, setForecasts] = useState<ForecastExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    archetype: '',
    minConfidence: 0,
  });

  useEffect(() => {
    async function loadForecasts() {
      try {
        const response = await fetch('/api/forecast/list');
        if (!response.ok) throw new Error('Failed to load forecasts');
        const data = await response.json();
        setForecasts(data.sort((a: ForecastExport, b: ForecastExport) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
      } catch (err) {
        console.error('Error loading forecasts:', err);
        setError('Failed to load forecasts. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadForecasts();
  }, []);

  const filteredForecasts = forecasts.filter(forecast => {
    const matchesSearch = filters.search === '' || 
      forecast.metadata.topSymbols.some(s => 
        s.symbol.toLowerCase().includes(filters.search.toLowerCase())
      );
    
    const matchesArchetype = filters.archetype === '' || 
      forecast.metadata.dominantArchetype === filters.archetype;
    
    const matchesConfidence = forecast.metadata.averageConfidence >= filters.minConfidence;

    return matchesSearch && matchesArchetype && matchesConfidence;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Symbolic Forecast Archive</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search symbols..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="px-4 py-2 border rounded-lg"
          />
          
          <select
            value={filters.archetype}
            onChange={e => setFilters(f => ({ ...f, archetype: e.target.value }))}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">All Archetypes</option>
            <option value="Flame">Flame</option>
            <option value="Mirror">Mirror</option>
            <option value="Oracle">Oracle</option>
          </select>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={filters.minConfidence}
            onChange={e => setFilters(f => ({ ...f, minConfidence: parseFloat(e.target.value) }))}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredForecasts.map(forecast => (
          <ForecastCard key={forecast.timestamp} forecast={forecast} />
        ))}
      </div>

      {filteredForecasts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No forecasts match the current filters.</p>
        </div>
      )}
    </div>
  );
} 