'use client';

import { useEffect, useState } from 'react';
import { FormattedMemoryHistory, formatMemoryTimestamp } from '@/lib/getTracMemoryHistory';
import { MemoryTriggerEntry } from '@/lib/memory/memoryLog';

export default function MemoryTimeline() {
  const [history, setHistory] = useState<FormattedMemoryHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/memory-history');
        if (!res.ok) throw new Error('Failed to fetch memory history');
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load memory history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    // Refresh every 30 seconds
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-black text-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-800 rounded w-1/3"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-zinc-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black text-white p-6">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (!history || history.recent.length === 0) {
    return (
      <div className="bg-black text-white p-6">
        <h2 className="text-xl font-bold border-b border-zinc-800 pb-2">🧠 Symbolic Memory Timeline</h2>
        <p className="text-gray-400 mt-4">No memory triggers yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-black text-white p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
        <h2 className="text-xl font-bold">🧠 Symbolic Memory Timeline</h2>
        <div className="text-sm text-gray-400">
          {history.summary.totalTriggers} triggers • {history.summary.uniqueNodes} nodes
        </div>
      </div>

      <div className="space-y-4">
        {history.recent.map((entry) => (
          <div
            key={`${entry.id}-${entry.triggeredAt}`}
            className="bg-zinc-800 rounded-xl p-4 shadow-md border border-zinc-700 hover:border-zinc-600 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-400">
                  {formatMemoryTimestamp(entry.triggeredAt)}
                </div>
                <div className="font-semibold text-blue-400 mt-1">{entry.title}</div>
              </div>
              <button
                onClick={() => setExpandedEntry(
                  expandedEntry === `${entry.id}-${entry.triggeredAt}` ? null : `${entry.id}-${entry.triggeredAt}`
                )}
                className="text-gray-400 hover:text-white"
              >
                {expandedEntry === `${entry.id}-${entry.triggeredAt}` ? '▼' : '▶'}
              </button>
            </div>

            <div className="text-gray-300 mt-2">🗣️ {entry.input}</div>

            {expandedEntry === `${entry.id}-${entry.triggeredAt}` && (
              <div className="mt-4 pt-4 border-t border-zinc-700 space-y-2">
                <div className="text-sm">
                  <span className="text-gray-400">Node ID:</span>{' '}
                  <span className="text-gray-300">{entry.id}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Weight:</span>{' '}
                  <span className="text-gray-300">{entry.context?.weight.toFixed(2)}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Status:</span>{' '}
                  <span className="text-gray-300">{entry.context?.status}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Usage Count:</span>{' '}
                  <span className="text-gray-300">{entry.context?.usageCount}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 