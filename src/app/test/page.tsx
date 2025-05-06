"use client";

import { useState } from "react";

async function getTriggerData(input: string) {
  const res = await fetch("/api/test-memory/trigger", {
    method: "POST",
    body: JSON.stringify({ input }),
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
}

async function getAgentResponse(input: string) {
  const res = await fetch("/api/test-memory/agent", {
    method: "POST",
    body: JSON.stringify({ input }),
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
}

export default function TestPage() {
  const [input, setInput] = useState("");
  const [activePanel, setActivePanel] = useState<"trigger" | "agent">("trigger");
  const [triggered, setTriggered] = useState<any[]>([]);
  const [agentResponse, setAgentResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrigger = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTriggerData(input);
      setTriggered(data);
    } catch (err) {
      setError("Failed to trigger memory");
    } finally {
      setLoading(false);
    }
  };

  const handleAgent = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAgentResponse(input);
      setAgentResponse(data.response);
    } catch (err) {
      setError("Failed to simulate agent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with panel toggles */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700 bg-zinc-900">
        <h1 className="text-lg font-semibold text-white">Symbolic Memory Test Panel</h1>
        <div className="space-x-2">
          <button
            className={`px-3 py-1 text-sm rounded-md ${activePanel === "trigger" ? "bg-blue-600 hover:bg-blue-500" : "bg-zinc-700 hover:bg-zinc-600"} text-white`}
            onClick={() => setActivePanel("trigger")}
          >
            Trigger Memory
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${activePanel === "agent" ? "bg-green-600 hover:bg-green-500" : "bg-zinc-700 hover:bg-zinc-600"} text-white`}
            onClick={() => setActivePanel("agent")}
          >
            Simulate TracAgent
          </button>
        </div>
      </div>

      {/* Panel Content */}
      <div className="max-w-2xl mx-auto p-4">
        <textarea
          className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded-md text-white mb-4"
          placeholder={
            activePanel === "trigger"
              ? "Type symbolic test input..."
              : "Enter chat input for TracAgent..."
          }
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        {activePanel === "trigger" && (
          <>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 mb-4"
              onClick={handleTrigger}
              disabled={loading}
            >
              {loading ? "Triggering..." : "Trigger Memory"}
            </button>
            {error && <div className="text-red-400 mb-2">{error}</div>}
            <div className="space-y-2 mt-4">
              {triggered.length === 0 && !loading && (
                <div className="text-gray-400">No symbolic memories triggered.</div>
              )}
              {triggered.map((mem) => (
                <div key={mem.id} className="p-3 border border-zinc-600 rounded-md bg-zinc-800">
                  <div className="text-sm font-semibold text-blue-300">🧠 {mem.title}</div>
                  <div className="text-xs text-gray-400">ID: {mem.id}</div>
                  <div className="text-xs text-gray-400">Usage: {mem.usageCount}</div>
                  <div className="text-xs text-gray-400">Weight: {mem.weight?.toFixed(2) ?? mem.context?.weight?.toFixed(2)}</div>
                  <div className="text-xs text-gray-400">Last Triggered: {mem.lastTriggered || mem.context?.lastTriggered || 'N/A'}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {activePanel === "agent" && (
          <>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500 mb-4"
              onClick={handleAgent}
              disabled={loading}
            >
              {loading ? "Simulating..." : "Simulate Agent"}
            </button>
            {error && <div className="text-red-400 mb-2">{error}</div>}
            {agentResponse && (
              <div className="bg-zinc-800 p-4 rounded-md border border-zinc-700 mt-4">
                <div className="text-sm text-gray-300 whitespace-pre-line">
                  <strong>Agent:</strong> {agentResponse}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 