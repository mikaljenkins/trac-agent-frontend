'use client'

import { useEffect, useState } from 'react';
import { ResonanceDashboard } from '@/ui/diagnostics/ResonanceDashboard';
import { ExportResonanceData } from '@/components/ExportResonanceData';

export default function ResonancePage() {
  const [resonanceData, setResonanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [showFadingSymbols, setShowFadingSymbols] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/meta/report');
        const json = await res.json();
        setResonanceData(json);
      } catch (err) {
        console.error('Failed to fetch resonance data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Resonance Dashboard</h1>
        <div className="flex space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showFadingSymbols}
              onChange={(e) => setShowFadingSymbols(e.target.checked)}
              className="form-checkbox"
            />
            <span>Show Fading Symbols</span>
          </label>
        </div>
      </div>

      <ResonanceDashboard
        timeRange={timeRange}
        showFadingSymbols={showFadingSymbols}
      />
      
      {resonanceData && <ExportResonanceData data={resonanceData} />}
    </div>
  );
} 