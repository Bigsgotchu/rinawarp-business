/**
 * ============================================================
 * ⚡ RinaWarp Terminal Pro – Advanced Terminal Component
 * ------------------------------------------------------------
 * React wrapper for the RealTerminal core.
 * Handles mounting, resizing, user input, and AI event bridge.
 * ============================================================
 */

import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { SearchAddon } from '@xterm/addon-search';
import { Unicode11Addon } from '@xterm/addon-unicode11';
import '@xterm/xterm/css/xterm.css';

// Optional: preload integration (Electron bridge)
const ipc = window.RinaWarpAPI || null;

const AdvancedTerminal = ({ onAIQuery }) => {
  const containerRef = useRef(null);
  const [term, setTerm] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize addons
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    const searchAddon = new SearchAddon();
    const unicode11Addon = new Unicode11Addon();

    // Initialize terminal
    const terminal = new Terminal({
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 14,
      cursorBlink: true,
      convertEol: true,
      rows: 24,
      cols: 80,
      theme: {
        background: '#0d1117',
        foreground: '#c9d1d9',
        cursor: '#00ffff',
        selectionBackground: '#00ffff33',
      },
    });

    // Load addons
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);
    terminal.loadAddon(searchAddon);
    terminal.loadAddon(unicode11Addon);

    // Mount terminal
    terminal.open(containerRef.current);
    fitAddon.fit();

    // Welcome message
    terminal.writeln('🪐 Welcome to RinaWarp Terminal Pro');
    terminal.writeln('Type /ai <prompt> or normal commands below.\r\n');

    // Handle user input
    terminal.onData((data) => {
      const input = data.trim();

      // Simple AI command trigger
      if (input.startsWith('/ai ')) {
        const prompt = input.slice(4);
        terminal.writeln(`🤖 [AI] Thinking about: "${prompt}"`);
        if (onAIQuery) onAIQuery(prompt);
        if (ipc) ipc.invoke('ai:query', prompt);
      } else if (input === 'clear') {
        terminal.clear();
      } else if (input) {
        terminal.writeln(`> ${input}`);
      }
    });

    // Auto-fit on window resize
    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch (err) {
        console.warn('FitAddon resize failed', err);
      }
    };
    window.addEventListener('resize', handleResize);

    // Save reference for cleanup
    setTerm(terminal);

    return () => {
      window.removeEventListener('resize', handleResize);
      terminal.dispose();
      console.log('🧹 AdvancedTerminal unmounted.');
    };
  }, [onAIQuery]);

  // Basic command bar (optional)
  const handleClear = () => term?.clear();
  const handleFocus = () => term?.focus();

  return (
    <div className="flex flex-col w-full h-full bg-[#0d1117] text-white">
      <div className="flex items-center justify-between p-2 border-b border-gray-700">
        <span className="text-sm text-cyan-400 font-mono">
          RinaWarp Terminal Pro
        </span>
        <div className="space-x-2">
          <button
            onClick={handleFocus}
            className="px-2 py-1 text-xs bg-cyan-700 hover:bg-cyan-600 rounded"
          >
            Focus
          </button>
          <button
            onClick={handleClear}
            className="px-2 py-1 text-xs bg-rose-700 hover:bg-rose-600 rounded"
          >
            Clear
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-hidden" />
    </div>
  );
};

export default AdvancedTerminal;
