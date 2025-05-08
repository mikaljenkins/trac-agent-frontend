'use client';

import { useEffect, useState } from 'react';
import { 
  calculateSymbolicResonance, 
  getTopResonantSymbols, 
  calculateResonanceStability,
  groupResonantSymbolsByDecay 
} from '../../ai-core/symbolicResonanceTracker';
import { WeeklyReflectionEntry } from '@core/weeklyReflectionSynthesizer';
import { SymbolicMemoryNode } from '@core/memorySync';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ResonanceData {
  label: string;
  count: number;
  stability: number;
  decayScore?: number;
}

export default function ResonanceViewerPage() {
  const [resonanceData, setResonanceData] = useState<ResonanceData[]>([]);
  const [stabilityScore, setStabilityScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    async function loadResonance() {
      setLoading(true);
      try {
        // TODO: Replace with real API calls
        const response = await fetch('/api/reflections/history');
        const reflections: WeeklyReflectionEntry[] = await response.json();
        
        const memoryResponse = await fetch('/api/memory/current');
        const memory: SymbolicMemoryNode[] = await memoryResponse.json();

        // Calculate resonance metrics
        const resonanceMap = calculateSymbolicResonance(reflections, memory);
        const topSymbols = getTopResonantSymbols(resonanceMap, 10);
        const stability = calculateResonanceStability(reflections);
        const { persisting, fading } = groupResonantSymbolsByDecay(resonanceMap, memory);

        // Combine data for display
        const combinedData = topSymbols.map((symbol: { label: string; count: number }) => ({
          label: symbol.label,
          count: symbol.count,
          stability: stability,
          decayScore: memory.find(node => node.label === symbol.label)?.decayScore
        }));

        setResonanceData(combinedData);
        setStabilityScore(stability);
      } catch (error) {
        console.error('Failed to load resonance data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadResonance();
  }, [timeRange]);

  const chartData = {
    labels: resonanceData.map(item => item.label),
    datasets: [
      {
        label: 'Resonance Score',
        data: resonanceData.map(item => item.count),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Stability',
        data: resonanceData.map(item => item.stability),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Symbolic Resonance Analysis',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🔮 Symbolic Resonance Viewer</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 rounded ${timeRange === 'week' ? 'bg-blue-600' : 'bg-zinc-700'}`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded ${timeRange === 'month' ? 'bg-blue-600' : 'bg-zinc-700'}`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1 rounded ${timeRange === 'year' ? 'bg-blue-600' : 'bg-zinc-700'}`}
          >
            Year
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <div className="bg-zinc-800 rounded-lg p-4 mb-4">
              <h2 className="text-xl font-semibold mb-2">Overall Stability</h2>
              <div className="text-3xl font-bold text-blue-400">
                {(stabilityScore * 100).toFixed(1)}%
              </div>
            </div>

            <div className="bg-zinc-800 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Resonance Trends</h2>
              <Line options={chartOptions} data={chartData} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-800 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Top Resonant Symbols</h2>
              <div className="space-y-3">
                {resonanceData.map((item) => (
                  <div key={item.label} className="bg-zinc-700 rounded p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-blue-400">{item.count.toFixed(1)}</span>
                    </div>
                    <div className="mt-1 text-sm text-zinc-400">
                      Stability: {(item.stability * 100).toFixed(1)}%
                      {item.decayScore !== undefined && (
                        <span className="ml-2">
                          Decay: {(item.decayScore * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-800 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Memory Health</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Persisting Symbols</h3>
                  <div className="space-y-2">
                    {resonanceData
                      .filter(item => item.decayScore && item.decayScore < 0.5)
                      .map(item => (
                        <div key={item.label} className="bg-green-900/30 rounded p-2">
                          {item.label}
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Fading Symbols</h3>
                  <div className="space-y-2">
                    {resonanceData
                      .filter(item => item.decayScore && item.decayScore >= 0.5)
                      .map(item => (
                        <div key={item.label} className="bg-red-900/30 rounded p-2">
                          {item.label}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 