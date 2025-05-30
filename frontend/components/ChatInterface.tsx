'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface ChatEntry {
  role: 'user' | 'agent';
  message: string;
  timestamp: number;
}

export function ChatInterface() {
  const [chat, setChat] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('trac-chat');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatEntry[];
        const validEntries = parsed.filter(entry => 
          entry.role === 'user' || entry.role === 'agent'
        );
        setChat(validEntries);
      } catch (e) {
        console.error('Error parsing saved chat:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('trac-chat', JSON.stringify(chat));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  async function sendMessage() {
    if (!input.trim()) return;
    const newChat = [...chat, { role: 'user' as const, message: input, timestamp: Date.now() }];
    setChat(newChat);
    setInput('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/run-llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input })
      });
      
      if (!res.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await res.text();
      setChat(prev => [...prev, { role: 'agent' as const, message: data, timestamp: Date.now() }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setChat(prev => [...prev, { 
        role: 'agent' as const, 
        message: 'Sorry, I encountered an error. Please try again.', 
        timestamp: Date.now() 
      }]);
    } finally {
      setIsThinking(false);
    }
  }

  return (
    <div className="relative flex flex-col h-full bg-neutral-950 text-neutral-100 p-6 rounded-xl shadow-xl border border-neutral-800">
      {/* Ambient background animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-neutral-900 to-black opacity-30 blur-2xl pointer-events-none" />
      
      {/* TracAgent eye animation when thinking */}
      {isThinking && (
        <motion.div
          className="absolute top-4 right-4 w-3 h-3 bg-blue-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
            boxShadow: [
              '0 0 5px rgba(59, 130, 246, 0.5)',
              '0 0 20px rgba(59, 130, 246, 0.8)',
              '0 0 5px rgba(59, 130, 246, 0.5)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 relative z-10">
        {chat.map((entry, i) => (
          <motion.div
            key={i}
            className={`p-3 rounded-lg max-w-xl ${
              entry.role === 'agent'
                ? 'bg-neutral-700 self-start text-left shadow-md shadow-blue-500/20'
                : 'bg-neutral-800 self-end text-right'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {entry.message}
            <div className="text-xs text-neutral-400 mt-1">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </div>
          </motion.div>
        ))}
        {isThinking && (
          <motion.div
            className="text-blue-400 animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            TracAgent is thinking...
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="mt-4 flex gap-2 relative z-10">
        <input
          className="flex-1 bg-neutral-800 p-3 rounded-lg outline-none border border-neutral-600 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 transition-all"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask TracAgent..."
        />
        <button
          className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors hover:shadow-lg hover:shadow-blue-500/20"
          type="submit"
          disabled={isThinking}
        >
          Send
        </button>
      </form>
    </div>
  );
} 