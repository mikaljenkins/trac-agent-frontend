'use client';

import { useState, useEffect, useRef } from 'react';

interface AuditEntry {
  timestamp: string;
  summary: string;
  alignmentScore: number;
  issues: string[];
}

interface SelfCheckResponse {
  lastReflections: AuditEntry[];
  lastInsightInjected?: string;
}

export function AuditLogViewer() {
  const [auditData, setAuditData] = useState<SelfCheckResponse | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [manualCooldown, setManualCooldown] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const manualTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchAuditData();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (manualTimeoutRef.current) clearTimeout(manualTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchAuditData(true);
      }, 15000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh]);

  const fetchAuditData = async (isAuto = false) => {
    setIsRefreshing(true);
    if (!isAuto) {
      setManualCooldown(true);
      if (manualTimeoutRef.current) clearTimeout(manualTimeoutRef.current);
      manualTimeoutRef.current = setTimeout(() => setManualCooldown(false), 1500);
    }
    try {
      const res = await fetch('/api/seed-audit-log');
      const data = await res.json();
      setAuditData({ lastReflections: data.logs });
      setError(null);
    } catch (err) {
      setError('Failed to fetch audit data');
      console.error('Error fetching audit data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getAlignmentColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Self-Audit Log</h2>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-zinc-300 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={() => setAutoRefresh(v => !v)}
              className="form-checkbox h-4 w-4 text-blue-500 rounded focus:ring-0 border-zinc-600 bg-zinc-800"
            />
            <span>Auto-Refresh</span>
            {autoRefresh && (
              <span className="ml-1 animate-pulse text-blue-400 text-xs">{isRefreshing ? 'Refreshing...' : 'Active'}</span>
            )}
          </label>
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="px-3 py-1 text-sm bg-zinc-700 hover:bg-zinc-600 rounded-md text-white"
          >
            {showRaw ? 'Show Formatted' : 'Show Raw JSON'}
          </button>
          <button
            onClick={() => fetchAuditData(false)}
            disabled={isRefreshing || manualCooldown}
            className={`flex items-center px-3 py-1 text-sm rounded-md transition-colors duration-150 ${isRefreshing || manualCooldown ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' : 'bg-zinc-700 hover:bg-zinc-600 text-white'}`}
            title="Refresh Now"
          >
            {isRefreshing ? (
              <svg className="animate-spin h-4 w-4 mr-2 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"></path>
              </svg>
            ) : null}
            Refresh Now
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-200 mb-4">
          {error}
        </div>
      )}

      {!auditData ? (
        <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg text-zinc-400">
          Loading audit data...
        </div>
      ) : showRaw ? (
        <pre className="p-4 bg-zinc-800 rounded-lg overflow-auto text-sm text-zinc-300">
          {JSON.stringify(auditData, null, 2)}
        </pre>
      ) : (
        <div className="space-y-4">
          {auditData.lastReflections.map((entry, index) => (
            <div
              key={entry.timestamp}
              className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-zinc-400">🕰 {formatTimestamp(entry.timestamp)}</span>
                  <div className={`w-16 h-2 rounded-full ${getAlignmentColor(entry.alignmentScore)}`} />
                </div>
                {(entry.issues?.length ?? 0) > 0 && (
                  <div className="flex space-x-2">
                    {(entry.issues ?? []).map(issue => (
                      <span
                        key={issue}
                        className="px-2 py-1 text-xs bg-red-900/30 text-red-200 rounded-full"
                      >
                        ⚠️ {issue}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <p className="text-white mb-2">🧠 {entry.summary}</p>
              
              {index === 0 && auditData.lastInsightInjected && (
                <div className="mt-2 p-2 bg-blue-900/20 border border-blue-500 rounded-md">
                  <p className="text-blue-300 text-sm">
                    ⚡ Reflection Intervention: {auditData.lastInsightInjected}
                  </p>
                </div>
              )}

              <button
                className="mt-2 text-sm text-zinc-400 hover:text-zinc-200"
                onClick={() => {/* TODO: Implement depth review */}}
              >
                🔍 Review in Depth
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 