'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface ChatEntry {
  role: 'user' | 'agent';
  message: string;
  timestamp: number;
}

export default function HomePage() {
  const [chat, setChat] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('trac-chat');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatEntry[];
        // Validate that each entry has the correct role type
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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {chat.map((entry, i) => (
          <motion.div
            key={i}
            className={`p-3 rounded-lg max-w-xl ${
              entry.role === 'user' 
                ? 'bg-neutral-800 ml-auto' 
                : 'bg-neutral-700'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {entry.message}
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
      <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="mt-4 flex gap-2">
        <input
          className="flex-1 bg-neutral-800 p-3 rounded-lg outline-none border border-neutral-600 focus:border-blue-500"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask TracAgent..."
        />
        <button
          className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors"
          type="submit"
          disabled={isThinking}
        >
          Send
        </button>
      </form>
    </div>
  );
} 