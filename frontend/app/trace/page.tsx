'use client';

import { useState, useEffect } from 'react';
import { JournaledInvocation } from '../../../journal/invocations/writeLLMInvocation';

interface TraceViewerProps {
  traceId: string;
  timestamp: string;
}

export default function TraceViewer({ traceId, timestamp }: TraceViewerProps) {
  const [invocations, setInvocations] = useState<JournaledInvocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInvocations, setShowInvocations] = useState(true);

  useEffect(() => {
    async function fetchInvocations() {
      if (!timestamp) return;

      setLoading(true);
      setError(null);

      try {
        const date = timestamp.split('T')[0];
        const response = await fetch(`/api/invocations/${date}`);
        const data = await response.json();

        // Filter invocations based on timestamp proximity and context
        const relevantInvocations = data.invocations.filter((inv: JournaledInvocation) => {
          const invocationTime = new Date(inv.timestamp).getTime();
          const traceTime = new Date(timestamp).getTime();
          const timeDiff = Math.abs(invocationTime - traceTime);
          
          // Consider invocations within 5 minutes of the trace
          return timeDiff <= 5 * 60 * 1000;
        });

        setInvocations(relevantInvocations);
      } catch (err) {
        setError('Failed to load LLM invocations');
        console.error('Error fetching invocations:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchInvocations();
  }, [timestamp]);

  return (
    <div className="p-4">
      {/* Existing trace viewer content */}
      
      {/* LLM Invocations Section */}
      <div className="mt-8 border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">🧠 Archetype-Aligned Reflection</h2>
          <button
            onClick={() => setShowInvocations(!showInvocations)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {showInvocations ? 'Hide' : 'Show'} Reflections
          </button>
        </div>

        {loading && <p className="text-gray-500">Loading reflections...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {showInvocations && invocations.length > 0 ? (
          <div className="space-y-4">
            {invocations.map((invocation, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium">{invocation.provider}</span>
                    <span className="text-gray-500 ml-2">
                      {new Date(invocation.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    Confidence: {(invocation.metadata?.confidence ?? 0).toFixed(2)}
                  </span>
                </div>
                <div className="mt-2">
                  <details>
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      View Reflection
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-x-auto">
                      {invocation.text}
                    </pre>
                  </details>
                </div>
              </div>
            ))}
          </div>
        ) : showInvocations ? (
          <p className="text-gray-500">No reflections found for this trace.</p>
        ) : null}
      </div>
    </div>
  );
} 