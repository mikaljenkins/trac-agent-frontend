'use client';

import { useState, useEffect } from 'react';
import { DriftScoreReport } from '../../ai-core/symbolicDriftScorer';
import { TrendLine, formatTrendLine, detectDriftAnomalies } from '../../ai-core/driftVisualizer';
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

interface DataPoint {
  x: string;
  y: number;
}

export default function InsightPage() {
  const [trendData, setTrendData] = useState<TrendLine | null>(null);
  const [anomalies, setAnomalies] = useState<{
    convergenceCollapse: boolean;
    entropySurge: boolean;
    decaySpike: boolean;
  } | null>(null);

  useEffect(() => {
    async function loadDriftHistory() {
      try {
        // TODO: Replace with actual API call
        const response = await fetch('/api/drift/history');
        const history: DriftScoreReport[] = await response.json();
        
        const trendLine = formatTrendLine(history);
        setTrendData(trendLine);
        
        const detectedAnomalies = detectDriftAnomalies(history);
        setAnomalies(detectedAnomalies);
      } catch (err) {
        console.error('Failed to load drift history:', err);
      }
    }

    loadDriftHistory();
  }, []);

  if (!trendData) {
    return <div className="p-4">Loading drift analysis...</div>;
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Symbolic Memory Evolution',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
      },
    },
  };

  const mainMetricsData = {
    labels: trendData.entropy.map((point: DataPoint) => new Date(point.x).toLocaleDateString()),
    datasets: [
      {
        label: 'Entropy',
        data: trendData.entropy.map((point: DataPoint) => point.y),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Convergence',
        data: trendData.convergence.map((point: DataPoint) => point.y),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
      {
        label: 'Divergence',
        data: trendData.divergence.map((point: DataPoint) => point.y),
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1,
      },
      {
        label: 'Decay Rate',
        data: trendData.decayRate.map((point: DataPoint) => point.y),
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Symbolic Memory Insights</h1>
      
      {anomalies && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Anomaly Alerts</h2>
          <div className="space-y-2">
            {anomalies.convergenceCollapse && (
              <div className="bg-red-100 p-2 rounded">
                ⚠️ Convergence collapse detected
              </div>
            )}
            {anomalies.entropySurge && (
              <div className="bg-yellow-100 p-2 rounded">
                ⚠️ Entropy surge detected
              </div>
            )}
            {anomalies.decaySpike && (
              <div className="bg-orange-100 p-2 rounded">
                ⚠️ Decay rate spike detected
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Memory Evolution</h2>
        <div className="bg-white p-4 rounded-lg shadow">
          <Line options={chartOptions} data={mainMetricsData} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Dominant Symbols</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(trendData.dominantSymbols).map(([symbol, data]) => (
            <div key={symbol} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium mb-2">{symbol}</h3>
              <Line
                data={{
                  labels: (data as DataPoint[]).map(point => new Date(point.x).toLocaleDateString()),
                  datasets: [{
                    label: 'Dominance',
                    data: (data as DataPoint[]).map(point => point.y),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                  }],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 1,
                    },
                  },
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 