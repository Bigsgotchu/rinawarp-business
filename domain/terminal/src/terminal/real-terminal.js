/**
 * ============================================================
 * ⚡ RinaWarp Terminal Pro - Real Terminal Core
 * ------------------------------------------------------------
 * Handles the main xterm.js terminal instance, resizing,
 * output streaming, and Electron bridge integration.
 * ============================================================
 */

import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { SearchAddon } from '@xterm/addon-search';
import { Unicode11Addon } from '@xterm/addon-unicode11';
import '@xterm/xterm/css/xterm.css';

export default class RealTerminal {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;

    // Initialize xterm
    this.terminal = new Terminal({
      cols: 80,
      rows: 24,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 14,
      cursorBlink: true,
      theme: {
        background: '#0d1117',
        foreground: '#dfe6f3',
        cursor: '#00ffff',
        selectionBackground: '#00ffff33',
      },
      ...options,
    });

    // Add-ons
    this.fitAddon = new FitAddon();
    this.searchAddon = new SearchAddon();
    this.webLinksAddon = new WebLinksAddon();
    this.unicode11Addon = new Unicode11Addon();

    // Load add-ons
    this.terminal.loadAddon(this.fitAddon);
    this.terminal.loadAddon(this.searchAddon);
    this.terminal.loadAddon(this.webLinksAddon);
    this.terminal.loadAddon(this.unicode11Addon);
  }

  // ------------------------------------------------------------
  // Initialize terminal
  // ------------------------------------------------------------
  init() {
    if (!this.container) {
      console.error('❌ RealTerminal: No container element provided.');
      return;
    }

    this.terminal.open(this.container);
    this.fitAddon.fit();
    this.write('🪐 Welcome to RinaWarp Terminal Pro\n');
    this.write('Type a command or ask the AI...\n\n');

    // Handle input
    this.terminal.onData((data) => this.handleInput(data));

    // Auto-fit on resize
    window.addEventListener('resize', () => {
      try {
        this.fitAddon.fit();
      } catch (err) {
        console.warn('FitAddon resize failed:', err);
      }
    });

    console.log('✅ RealTerminal initialized');
  }

  // ------------------------------------------------------------
  // Input handling
  // ------------------------------------------------------------
  handleInput(data) {
    const char = data.trim();

    if (char === '') return;

    // Command trigger example
    if (char.toLowerCase() === 'clear') {
      this.clear();
      return;
    }

    if (char.startsWith('/ai ')) {
      const prompt = char.slice(4).trim();
      this.emit('ai:query', prompt);
      this.write(`🤖 [AI] Thinking about: "${prompt}"...\r\n`);
      return;
    }

    // Default echo
    this.write(`> ${char}\r\n`);
  }

  // ------------------------------------------------------------
  // Terminal output helpers
  // ------------------------------------------------------------
  write(text) {
    this.terminal.write(text);
  }

  clear() {
    this.terminal.clear();
  }

  focus() {
    this.terminal.focus();
  }

  resize(cols, rows) {
    this.terminal.resize(cols, rows);
    this.fitAddon.fit();
  }

  // ------------------------------------------------------------
  // Custom event system
  // ------------------------------------------------------------
  on(event, handler) {
    this.terminal.onData((data) => {
      if (event === 'input') handler(data);
    });
    // For custom integration events (AI, workflows, etc.)
    if (!this._events) this._events = {};
    this._events[event] = handler;
  }

  emit(event, data) {
    if (this._events?.[event]) {
      this._events[event](data);
    }
  }

  // ------------------------------------------------------------
  // Cleanup
  // ------------------------------------------------------------
  dispose() {
    this.terminal.dispose();
    window.removeEventListener('resize', this.fitAddon.fit);
    console.log('🧹 RealTerminal destroyed.');
  }
}
