'use client';

import { useState, useRef, useEffect } from 'react';
import { getTracResponse } from '../lib/getTracResponse';
import { getSessionMemory } from '../lib/agentState';
import { generateReflection } from '../lib/reflect';
import MemoryTimeline from './MemoryTimeline';

export default function TracAgentUI() {
  const [messages, setMessages] = useState<{ sender: 'user' | 'agent'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showMemoryTimeline, setShowMemoryTimeline] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: { sender: 'user'; text: string } = { sender: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    const responseText = await getTracResponse(userMessage.text);
    const agentReply: { sender: 'agent'; text: string } = { sender: 'agent', text: responseText };
    setMessages((prev) => [...prev, agentReply]);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <div className={`w-80 bg-zinc-900 border-r border-zinc-800 transition-transform duration-300 ${showPanel ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4">
          <h2 className="text-xl font-bold text-white mb-4">Mind</h2>
          <div className="space-y-4">
            <div className="bg-zinc-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Session Memory</h3>
              <div className="text-sm text-gray-400">
                {getSessionMemory().length} messages logged
              </div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Current Reflection</h3>
              <div className="text-sm text-gray-400">
                {generateReflection() || 'No reflection yet'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-4">
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="text-gray-400 hover:text-white"
          >
            {showPanel ? '←' : '→'}
          </button>
          <button
            onClick={() => setShowMemoryTimeline(!showMemoryTimeline)}
            className="text-gray-400 hover:text-white flex items-center gap-2"
          >
            <span>🧠</span>
            <span>Memory Timeline</span>
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-md break-words ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-gray-700 text-gray-100 rounded-bl-md'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-zinc-800 p-4">
          <form
            onSubmit={async e => {
              e.preventDefault();
              await sendMessage();
            }}
            className="flex gap-4"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-zinc-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Memory Timeline Panel */}
      <div className={`w-96 bg-zinc-900 border-l border-zinc-800 transition-transform duration-300 ${showMemoryTimeline ? 'translate-x-0' : 'translate-x-full'}`}>
        <MemoryTimeline />
      </div>
    </div>
  );
}