"use client";

import { useTracChat } from '@/hooks/useTracChat';
import { SupportedLLM } from '@/system/llm/llmAdapter';
import { useState } from 'react';

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<SupportedLLM>('mistral');
  const { messages, isLoading, sendMessage, setMessages } = useTracChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    setError(null);
    try {
      await sendMessage(input, selectedModel);
      setInput('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Add error message to chat
      const errorMessage = {
        role: 'agent' as const,
        content: '[Error] LLM call failed. Please check your API configuration.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh] w-full mx-auto border rounded-lg bg-white dark:bg-zinc-900 shadow-lg">
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 border-b">
          {error}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-[80%] whitespace-pre-line text-sm shadow ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : msg.content.startsWith('[Error]')
                  ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
              }`}
            >
              {msg.content}
            </div>
            <span className="text-xs text-zinc-400 mt-1">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 mt-2">
            <span className="animate-pulse text-zinc-400">Agent is thinking…</span>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex p-2 border-t bg-zinc-50 dark:bg-zinc-800">
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value as SupportedLLM)}
          className="px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring focus:border-blue-400"
          disabled={isLoading}
        >
          <option value="mistral">Mistral</option>
          <option value="deepseek">DeepSeek</option>
        </select>
        <input
          className="flex-1 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring focus:border-blue-400 ml-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
} 