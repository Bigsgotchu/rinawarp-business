import React, { useState } from 'react';
import { streamRinaResponse } from '../lib/rinawarp-api';

export default function RinaChatConsole() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false); // 👈 NEW

  const sendPrompt = async () => {
    if (!input.trim()) return;
    const prompt = input;
    setInput('');
    setIsLoading(true);
    setIsStreaming(true); // 👈 turn ON

    // push user message + empty assistant stub
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: prompt },
      { role: 'assistant', content: '' },
    ]);

    await streamRinaResponse(
      prompt,
      // onChunk
      (chunk) => {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          // defensive copy for React state
          const copy = prev.slice(0, -1);
          copy.push({ ...last, content: (last.content || '') + chunk });
          return copy;
        });
      },
      // onDone
      () => {
        setIsLoading(false);
        setIsStreaming(false); // 👈 turn OFF
      },
      // onError
      () => {
        setIsLoading(false);
        setIsStreaming(false); // 👈 turn OFF
      },
    );
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh] w-full max-w-3xl p-4 bg-black/80 text-green-400 font-mono rounded-xl shadow-xl border border-green-800/40">
      {/* Header with streaming indicator */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-green-300/90">RinaWarp • Terminal Pro</div>

        {/* Streaming pill */}
        <div className="flex items-center gap-2">
          <span
            className={[
              'inline-block h-2.5 w-2.5 rounded-full',
              isStreaming ? 'bg-green-400 animate-pulse' : 'bg-gray-600',
            ].join(' ')}
            title={isStreaming ? 'Streaming…' : 'Idle'}
          />
          <span className="text-xs text-green-300/80">{isStreaming ? 'Streaming…' : 'Idle'}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'text-pink-400' : 'text-green-300'}>
            {msg.role === 'user' ? '> ' : 'Rina: '}
            {msg.content}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex">
        <input
          className="flex-1 bg-gray-900/80 text-white p-2 rounded-l-xl outline-none border border-gray-700 focus:border-pink-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isStreaming ? 'Streaming… (press Enter to send again)' : 'Type your command…'
          }
          onKeyDown={(e) => e.key === 'Enter' && sendPrompt()}
          disabled={isLoading}
        />
        <button
          onClick={sendPrompt}
          disabled={isLoading}
          className="bg-pink-600 hover:bg-pink-700 disabled:bg-pink-600/50 text-white px-4 rounded-r-xl border border-pink-500"
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
