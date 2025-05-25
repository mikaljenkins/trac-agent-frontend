'use client'
import { saveAs } from 'file-saver';
import React, { useEffect, useState } from 'react';

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

interface SymbolicForecast {
  symbol: string;
  confidence: number;
  prediction: string;
}

interface ForecastExport {
  timestamp: string;
  forecasts: SymbolicForecast[];
  metadata: ForecastMetadata;
}

function ForecastCard({ forecast }: { forecast: ForecastExport }) {
  const date = new Date(forecast.timestamp).toLocaleDateString();
  const { metadata } = forecast;
  const driftScore = metadata.driftPredictions.reduce((sum, p) => sum + p.likelihood, 0) / 
    (metadata.driftPredictions.length || 1);

  return (
    <div className="rounded-xl shadow-md p-6 bg-white dark:bg-gray-900 transition-all hover:shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-sm text-gray-400 dark:text-gray-500">{date}</div>
          <div className="font-bold text-lg mt-1">{metadata.dominantArchetype}</div>
        </div>
        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
          {metadata.totalSymbols} symbols
        </span>
      </div>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Top Symbols</h4>
          <ul className="space-y-2">
            {metadata.topSymbols.map(({ symbol, confidence }) => (
              <li key={symbol} className="flex items-center justify-between">
                <span className="text-sm truncate flex-1">{symbol}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 dark:bg-blue-500"
                      style={{ width: `${confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                    {(confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {metadata.driftPredictions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Drift Risks</h4>
            <div className="space-y-1">
              {metadata.driftPredictions.map(({ symbol, likelihood }) => (
                <div key={symbol} className="flex items-center text-sm">
                  <span className="text-yellow-500 mr-2">⚠️</span>
                  <span className="flex-1 truncate">{symbol}</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {(likelihood * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Drift Score: </span>
            <span className="font-medium text-yellow-500">
              {(driftScore * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex space-x-2">
            <a
              href={`/api/forecast/${date}`}
              className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400"
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
              className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400"
            >
              Download
            </button>
          </div>
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
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
        <h1 className="text-3xl font-bold mb-4 dark:text-white">Symbolic Forecast Archive</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search symbols..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          
          <select
            value={filters.archetype}
            onChange={e => setFilters(f => ({ ...f, archetype: e.target.value }))}
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="">All Archetypes</option>
            <option value="Flame">Flame</option>
            <option value="Mirror">Mirror</option>
            <option value="Oracle">Oracle</option>
          </select>
          
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={filters.minConfidence}
              onChange={e => setFilters(f => ({ ...f, minConfidence: parseFloat(e.target.value) }))}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
              {Math.round(filters.minConfidence * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredForecasts.map(forecast => (
          <ForecastCard key={forecast.timestamp} forecast={forecast} />
        ))}
      </div>

      {filteredForecasts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No forecasts match the current filters.</p>
        </div>
      )}
    </div>
  );
} 