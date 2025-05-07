'use client';

import { useEffect, useState } from 'react';

export interface SymbolicMutation {
  id: string;
  type: 'reinforce' | 'decay' | 'create' | 'reroute';
  targetSymbol: string;
  rationale: string;
  outcome?: 'accepted' | 'rejected' | 'pending';
  stage?: string;
}

export interface SymbolicTrace {
  traceId: string;
  input: string;
  timestamp: string;
  stages: {
    step: string;
    output: any;
    insights?: string[];
  }[];
}

export type TraceListItem = {
  traceId: string;
  input: string;
  timestamp: string;
  insightCount?: number;
  mutationCount?: number;
};

export default function TraceViewer() {
  const [traceList, setTraceList] = useState<TraceListItem[]>([]);
  const [traceListLoading, setTraceListLoading] = useState(true);
  const [traceListError, setTraceListError] = useState<string | null>(null);
  const [selectedTraceId, setSelectedTraceId] = useState<string>('');
  const [trace, setTrace] = useState<SymbolicTrace | null>(null);
  const [mutations, setMutations] = useState<SymbolicMutation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [search, setSearch] = useState('');

  // Fetch trace list on mount or refresh
  useEffect(() => {
    loadTraceList();
  }, []);

  async function loadTraceList() {
    setTraceListLoading(true);
    setTraceListError(null);
    try {
      const res = await fetch('/api/traces/list');
      if (!res.ok) throw new Error('Failed to load trace list.');
      const data = await res.json();
      setTraceList(data);
    } catch (err: any) {
      setTraceListError(err.message || 'Unknown error');
      setTraceList([]);
    } finally {
      setTraceListLoading(false);
    }
  }

  // Auto-load the most recent trace on list load
  useEffect(() => {
    if (traceList.length > 0 && !selectedTraceId) {
      setSelectedTraceId(traceList[0].traceId);
    }
  }, [traceList]);

  // Fetch trace details when selectedTraceId changes or on auto-refresh
  useEffect(() => {
    if (!selectedTraceId) return;
    loadTrace(selectedTraceId);
    if (autoRefresh) {
      const interval = setInterval(() => loadTrace(selectedTraceId), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedTraceId, autoRefresh]);

  async function loadTrace(id: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/traces/${id}`);
      if (!res.ok) {
        throw new Error('Failed to load trace.');
      }
      const data = await res.json();
      setTrace(data.trace);
      setMutations(data.mutations || []);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setTrace(null);
      setMutations([]);
    } finally {
      setLoading(false);
    }
  }

  // Group mutations by stage
  const mutationsByStage: Record<string, SymbolicMutation[]> = {};
  const ungroupedMutations: SymbolicMutation[] = [];
  mutations.forEach((mutation) => {
    if (mutation.stage) {
      if (!mutationsByStage[mutation.stage]) {
        mutationsByStage[mutation.stage] = [];
      }
      mutationsByStage[mutation.stage].push(mutation);
    } else {
      ungroupedMutations.push(mutation);
    }
  });

  function getMutationTypeColor(type: SymbolicMutation['type']) {
    switch (type) {
      case 'reinforce': return 'bg-blue-900 text-blue-100';
      case 'decay': return 'bg-orange-900 text-orange-100';
      case 'create': return 'bg-green-900 text-green-100';
      case 'reroute': return 'bg-purple-900 text-purple-100';
      default: return 'bg-gray-700 text-gray-300';
    }
  }
  function getMutationOutcomeColor(outcome?: SymbolicMutation['outcome']) {
    switch (outcome) {
      case 'accepted': return 'bg-green-900 text-green-100';
      case 'rejected': return 'bg-red-900 text-red-100';
      case 'pending': return 'bg-yellow-900 text-yellow-100';
      default: return 'bg-gray-700 text-gray-300';
    }
  }

  // Filtered trace list for search
  const filteredTraceList = traceList.filter(item =>
    item.input.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto flex gap-8">
        {/* Sidebar: Trace List */}
        <div className="w-96 bg-gray-800 rounded p-4 flex flex-col">
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search input..."
              className="px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 w-full"
            />
          </div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-purple-300">Recent Traces</h2>
            <button
              onClick={loadTraceList}
              className="px-2 py-1 text-xs bg-purple-700 rounded hover:bg-purple-800"
            >
              Refresh
            </button>
          </div>
          {traceListLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          ) : traceListError ? (
            <div className="p-2 bg-red-900 text-red-100 rounded">{traceListError}</div>
          ) : filteredTraceList.length === 0 ? (
            <div className="p-2 text-gray-400">No traces found.</div>
          ) : (
            <div className="overflow-y-auto max-h-[70vh] space-y-2">
              {filteredTraceList.map(item => (
                <div
                  key={item.traceId}
                  onClick={() => setSelectedTraceId(item.traceId)}
                  className={`p-3 rounded cursor-pointer transition border ${selectedTraceId === item.traceId ? 'bg-purple-900 border-purple-400' : 'bg-gray-700 border-transparent hover:bg-gray-600'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-white truncate max-w-[200px]">{item.input}</div>
                      <div className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-xs text-purple-300 block">{item.insightCount ?? 0} insights</span>
                      <span className="text-xs text-blue-300 block">{item.mutationCount ?? 0} mutations</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Main: Trace Detail */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-purple-400">Symbolic Trace Viewer</h1>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-purple-500"
                />
                <span>Auto-refresh</span>
              </label>
              <button
                onClick={() => selectedTraceId && loadTrace(selectedTraceId)}
                className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 transition"
              >
                Refresh
              </button>
            </div>
          </div>
          {loading && (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-24 bg-gray-800 rounded"></div>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-900 text-red-100 rounded">
              {error}
            </div>
          )}
          {trace && (
            <div className="bg-gray-800 rounded p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-purple-300">
                  Trace Details
                </h2>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showRaw}
                    onChange={(e) => setShowRaw(e.target.checked)}
                    className="form-checkbox h-4 w-4 text-purple-500"
                  />
                  <span>Show Raw</span>
                </label>
              </div>
              {showRaw ? (
                <pre className="bg-gray-900 p-4 rounded overflow-auto max-h-[600px] text-sm">
                  {JSON.stringify({ trace, mutations }, null, 2)}
                </pre>
              ) : (
                <div className="space-y-6">
                  {trace.stages.map((stage) => (
                    <div key={stage.step} className="bg-gray-700 rounded p-4 mb-4">
                      <h3 className="text-lg font-medium text-purple-300 mb-2">
                        {stage.step}
                      </h3>
                      {stage.insights && stage.insights.length > 0 && (
                        <div className="mt-2">
                          <h4 className="text-sm font-medium text-gray-400 mb-2">
                            Insights:
                          </h4>
                          <ul className="space-y-2">
                            {stage.insights.map((insight, i) => (
                              <li
                                key={i}
                                className="text-sm bg-gray-600 p-2 rounded"
                              >
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {/* Mutations for this stage */}
                      {mutationsByStage[stage.step] && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-blue-300 mb-2">
                            Mutations:
                          </h4>
                          <div className="space-y-2">
                            {mutationsByStage[stage.step].map((mutation) => (
                              <div key={mutation.id} className="bg-gray-600 rounded p-3 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 text-xs rounded ${getMutationTypeColor(mutation.type)}`}>
                                    {mutation.type}
                                  </span>
                                  <span className="text-sm font-medium">
                                    {mutation.targetSymbol}
                                  </span>
                                  {mutation.outcome && (
                                    <span className={`px-2 py-1 text-xs rounded ${getMutationOutcomeColor(mutation.outcome)}`}>
                                      {mutation.outcome}
                                    </span>
                                  )}
                                </div>
                                {mutation.rationale && (
                                  <span className="ml-4 text-xs text-gray-200 italic">
                                    {mutation.rationale.length > 80 ? mutation.rationale.slice(0, 80) + '…' : mutation.rationale}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Ungrouped mutations */}
                  {ungroupedMutations.length > 0 && (
                    <div className="bg-gray-700 rounded p-4 mt-6">
                      <h3 className="text-lg font-medium text-blue-300 mb-2">
                        Ungrouped Mutations
                      </h3>
                      <div className="space-y-2">
                        {ungroupedMutations.map((mutation) => (
                          <div key={mutation.id} className="bg-gray-600 rounded p-3 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded ${getMutationTypeColor(mutation.type)}`}>
                                {mutation.type}
                              </span>
                              <span className="text-sm font-medium">
                                {mutation.targetSymbol}
                              </span>
                              {mutation.outcome && (
                                <span className={`px-2 py-1 text-xs rounded ${getMutationOutcomeColor(mutation.outcome)}`}>
                                  {mutation.outcome}
                                </span>
                              )}
                            </div>
                            {mutation.rationale && (
                              <span className="ml-4 text-xs text-gray-200 italic">
                                {mutation.rationale.length > 80 ? mutation.rationale.slice(0, 80) + '…' : mutation.rationale}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 