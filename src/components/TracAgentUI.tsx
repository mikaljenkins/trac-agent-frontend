'use client';

import { useState, useRef, useEffect } from 'react';

export default function TracAgentUI() {
  const [messages, setMessages] = useState<{ sender: 'user' | 'agent'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMessage: { sender: 'user'; text: string } = { sender: 'user', text: input.trim() };
    const agentReply: { sender: 'agent'; text: string } = { sender: 'agent', text: 'TracAgent is thinking...' };
    setMessages((prev) => [...prev, userMessage, agentReply]);
    setInput('');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-screen bg-zinc-900 text-gray-100 flex flex-col">
      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
      {/* Input Bar */}
      <div className="border-t border-zinc-700 bg-zinc-800 p-4">
        <form
          onSubmit={e => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <input
            className="flex-1 bg-zinc-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            autoFocus
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}