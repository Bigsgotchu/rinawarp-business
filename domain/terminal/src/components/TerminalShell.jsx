// src/components/TerminalShell.jsx

import React, { useState } from 'react';

export default function TerminalShell() {
  const [tabs, setTabs] = useState([{ id: 1, name: 'Tab 1' }]);
  const [activeTab, setActiveTab] = useState(1);
  const [output, setOutput] = useState([]);
  const [input, setInput] = useState('');

  const handleRun = () => {
    if (!input.trim()) return;
    const newOutput = `> ${input}`;
    setOutput((prev) => [...prev, newOutput]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white font-mono">
      {/* Tab Bar */}
      <div className="flex space-x-2 p-2 bg-gray-800 border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-3 py-1 rounded ${
              tab.id === activeTab
                ? 'bg-black border border-cyan-500 text-cyan-300'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Terminal Output */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 text-sm bg-gray-900">
        {output.length === 0 ? (
          <p className="text-gray-600 italic">Type a command below...</p>
        ) : (
          output.map((line, index) => (
            <pre key={index} className="text-green-400 whitespace-pre-wrap">
              {line}
            </pre>
          ))
        )}
      </div>

      {/* Command Input */}
      <div className="border-t border-gray-700 p-2 bg-gray-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRun()}
          placeholder="Enter command..."
          className="w-full px-4 py-2 rounded bg-gray-900 text-white outline-none focus:ring-2 ring-cyan-400"
        />
      </div>
    </div>
  );
}
