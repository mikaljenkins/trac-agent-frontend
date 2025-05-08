import React, { useState, useEffect } from 'react';
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

interface SymbolicMemoryNode {
  label: string;
  decayScore: number;
  reinforcementScore: number;
  lastReinforced?: string;
}

interface WeeklyReflectionEntry {
  weekEnding: string;
  dominantSymbols: string[];
  archetypeForecast: string;
  symbolicEntropyLevel: number;
  narrative: string;
  diff?: {
    repeatedSymbols: string[];
    addedSymbols: string[];
    fadedSymbols: string[];
    archetypeShift?: string;
    entropyDelta?: number;
  };
}

interface LoopHealthData {
  completionRate: number;
  averageDuration: number;
  stuckLoopCount: number;
  healthScore: number;
}

interface ResonanceDashboardProps {
  timeRange: 'week' | 'month' | 'year';
  showFadingSymbols: boolean;
}

export const ResonanceDashboard: React.FC<ResonanceDashboardProps> = ({
  timeRange,
  showFadingSymbols
}) => {
  const [memory, setMemory] = useState<SymbolicMemoryNode[]>([]);
  const [reflections, setReflections] = useState<WeeklyReflectionEntry[]>([]);
  const [loopHealth, setLoopHealth] = useState<LoopHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current memory state
        const memoryRes = await fetch('/api/memory/current');
        const memoryData = await memoryRes.json();
        setMemory(memoryData);

        // Fetch reflection history
        const reflectionsRes = await fetch('/api/reflections/history');
        const reflectionsData = await reflectionsRes.json();
        setReflections(reflectionsData);

        // Fetch loop health data
        const healthRes = await fetch('/api/meta/report');
        const healthData = await healthRes.json();
        setLoopHealth(healthData.loopHealth);

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Calculate resonance scores
  const calculateResonance = (symbol: string): number => {
    const node = memory.find(n => n.label === symbol);
    if (!node) return 0;
    return (1 - node.decayScore) * (node.reinforcementScore || 1);
  };

  // Get top resonant symbols
  const topSymbols = memory
    .filter(node => showFadingSymbols || node.decayScore < 0.7)
    .sort((a, b) => calculateResonance(b.label) - calculateResonance(a.label))
    .slice(0, 10);

  // Prepare trend data for chart
  const trendData = {
    labels: reflections.map(r => r.weekEnding),
    datasets: topSymbols.map(symbol => ({
      label: symbol.label,
      data: reflections.map(r => 
        r.dominantSymbols.includes(symbol.label) ? 1 : 0
      ),
      borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
      tension: 0.4
    }))
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Symbolic Resonance Dashboard</h2>
      
      {/* Resonance Overlay */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Top Resonant Symbols</h3>
          <div className="space-y-2">
            {topSymbols.map(symbol => (
              <div
                key={symbol.label}
                className="flex items-center justify-between p-2 bg-white rounded shadow-sm"
              >
                <span className="font-medium">{symbol.label}</span>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden"
                  >
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${calculateResonance(symbol.label) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    {Math.round(calculateResonance(symbol.label) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Symbol Frequency Trends */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Symbol Frequency Trends</h3>
          <div className="h-64">
            <Line
              data={trendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 1
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Drift Visualization */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Symbolic Drift Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reflections.slice(0, 3).map((reflection, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">
                Week of {reflection.weekEnding}
              </h4>
              {reflection.diff && (
                <div className="space-y-2">
                  <div>
                    <span className="text-green-600">↑</span>
                    <span className="ml-2">
                      {reflection.diff.addedSymbols.length} new symbols
                    </span>
                  </div>
                  <div>
                    <span className="text-red-600">↓</span>
                    <span className="ml-2">
                      {reflection.diff.fadedSymbols.length} faded symbols
                    </span>
                  </div>
                  {reflection.diff.archetypeShift && (
                    <div className="text-blue-600">
                      Archetype shift: {reflection.diff.archetypeShift}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Loop Health Monitor */}
      {loopHealth && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Loop Health Monitor</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Completion Rate</h4>
              <div className="text-2xl font-bold">
                {Math.round(loopHealth.completionRate * 100)}%
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Stuck Loops</h4>
              <div className="text-2xl font-bold text-red-600">
                {loopHealth.stuckLoopCount}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Health Score</h4>
              <div
                className={`text-2xl font-bold ${
                  loopHealth.healthScore > 0.7
                    ? 'text-green-600'
                    : loopHealth.healthScore > 0.4
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {Math.round(loopHealth.healthScore * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 