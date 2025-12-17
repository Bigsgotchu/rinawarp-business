import React, { useState } from 'react';
import { streamRinaResponse } from '../lib/rinawarp-api';

/**
 * RinaWarp Chat Console — live frontend interface
 * Handles streaming AI responses and visual state indicators
 */
export default function RinaChatConsole() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendPrompt = async () => {
    if (!input.trim()) return;

    const prompt = input.trim();
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);

    // push user message + empty assistant stub
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: prompt },
      { role: 'assistant', content: '' },
    ]);

    try {
      await streamRinaResponse(
        prompt,
        // onChunk
        (chunk) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            updated[updated.length - 1] = {
              ...last,
              content: (last.content || '') + chunk,
            };
            return updated;
          });
        },
        // onDone
        () => {
          setIsLoading(false);
          setIsStreaming(false);
        },
        // onError
        (err) => {
          console.error('Streaming error:', err);
          setIsLoading(false);
          setIsStreaming(false);
        }
      );
    } catch (err) {
      console.error('Error sending prompt:', err);
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh] w-full max-w-3xl p-4 bg-black/80 text-gray-200 rounded-2xl border border-gray-700 shadow-xl backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-green-300/90 font-semibold">
          RinaWarp • Terminal Pro
        </div>

        {/* Streaming indicator */}
        <div className="flex items-center gap-2">
          <span
            className={[
              'inline-block h-2.5 w-2.5 rounded-full',
              isStreaming ? 'bg-green-400 animate-pulse' : 'bg-gray-600',
            ].join(' ')}
            title={isStreaming ? 'Streaming…' : 'Idle'}
          />
          <span className="text-xs text-green-300/80">
            {isStreaming ? 'Streaming…' : 'Idle'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.role === 'user' ? 'text-pink-400' : 'text-green-300'}
          >
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
            isStreaming
              ? 'Streaming… (wait for response)'
              : 'Type your command and press Enter…'
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
