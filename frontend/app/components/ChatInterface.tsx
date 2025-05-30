"use client";

import { useEffect, useRef, useState } from "react";

interface ChatEntry {
  role: "user" | "agent";
  message: string;
  timestamp: string;
}

export function ChatInterface() {
  const [chat, setChat] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("chat");
    if (saved) setChat(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("chat", JSON.stringify(chat));
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const userEntry: ChatEntry = {
      role: "user",
      message: input,
      timestamp: new Date().toISOString(),
    };
    setChat((c) => [...c, userEntry]);
    setInput("");
    setIsThinking(true);
    try {
      const res = await fetch("/api/run-llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setChat((c) => [
        ...c,
        {
          role: "agent",
          message: data.response || "(No response)",
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setChat((c) => [
        ...c,
        {
          role: "agent",
          message: "Sorry, there was an error.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[80vh] w-full mx-auto border rounded-lg bg-white dark:bg-zinc-900 shadow-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {chat.map((entry, i) => (
          <div
            key={i}
            className={`flex flex-col ${entry.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-[80%] whitespace-pre-line text-sm shadow ${
                entry.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              }`}
            >
              {entry.message}
            </div>
            <span className="text-xs text-zinc-400 mt-1">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        {isThinking && (
          <div className="flex items-center space-x-2 mt-2">
            <span className="animate-pulse text-zinc-400">Agent is thinking…</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex p-2 border-t bg-zinc-50 dark:bg-zinc-800">
        <input
          className="flex-1 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring focus:border-blue-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isThinking}
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
          disabled={isThinking || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
} 