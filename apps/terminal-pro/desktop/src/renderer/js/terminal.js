/**
 * RinaWarp Terminal Pro - Terminal Management
 */

// Import GhostTextRenderer and v1 suggestions
import { attachGhostText } from '../components/GhostTextRenderer.js';

import { getV1Suggestion } from './v1-suggestions.js';

class TerminalManager {
  constructor() {
    this.terminals = new Map();
    this.activeTerminalId = null;
    this.terminalCounter = 0;
    this.terminalHistory = [];
    this.maxHistorySize = 100;
    this.config = {
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Fira Code, Monaco, Cascadia Code, monospace',
      theme: 'mermaid',
      scrollback: 1000,
      cursorBlink: true,
    };

    // Ghost text state
    this.ghostSuggestion = '';
    this.ghostRenderer = null;
    this.inputEl = null;

    this.initializeXterm();
  }

  initializeXterm() {
    // Add-on modules will be loaded dynamically as needed
    this.loadedAddons = new Set();
  }

  async initialize() {
    try {
      // Load Xterm.js and addons
      await this.loadXtermDependencies();

      // Initialize terminal settings
      this.setupTerminalSettings();

      // Setup IPC listeners for terminal events
      this.setupIPClisteners();

      console.log('Terminal Manager initialized');
    } catch (error) {
      console.error('Failed to initialize terminal:', error);
      throw error;
    }
  }

  setupIPClisteners() {
    if (window.electronAPI) {
      // Listen for terminal output
      window.electronAPI.on('terminal-output', (terminalId, data) => {
        const terminal = this.terminals.get(terminalId)?.terminal;
        if (terminal) {
          terminal.write(data);
          this.updateGhostSuggestion(data);
        }
      });

      // Listen for terminal errors
      window.electronAPI.on('terminal-error', (terminalId, data) => {
        const terminal = this.terminals.get(terminalId)?.terminal;
        if (terminal) {
          terminal.write('\x1b[31m' + data + '\x1b[0m'); // Red color
        }
      });

      // Listen for terminal exit
      window.electronAPI.on('terminal-exit', (terminalId, code) => {
        const terminal = this.terminals.get(terminalId)?.terminal;
        if (terminal) {
          terminal.write(`\r\n\r\nProcess exited with code ${code}\r\n`);
          const terminalInfo = this.terminals.get(terminalId);
          if (terminalInfo) {
            terminalInfo.shell = null;
          }
        }
      });
    }
  }

  async loadXtermDependencies() {
    // Load Xterm.js if not already loaded
    if (typeof Terminal === 'undefined') {
      await this.loadScript('https://cdn.jsdelivr.net/npm/xterm@5.3.0/lib/xterm.js');
    }

    // Load addons as needed
    await this.loadAddon('fit');
    await this.loadAddon('web-links');
    await this.loadAddon('search');
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async loadAddon(addonName) {
    if (this.loadedAddons.has(addonName)) return;

    try {
      await this.loadScript(
        `https://cdn.jsdelivr.net/npm/xterm-addon-${addonName}@0.8.0/lib/xterm-addon-${addonName}.js`,
      );
      this.loadedAddons.add(addonName);
    } catch (error) {
      console.warn(`Failed to load addon ${addonName}:`, error);
    }
  }

  setupTerminalSettings() {
    // Load user preferences
    this.loadPreferences();

    // Setup global keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Initialize ghost text after DOM is ready
    this.initializeGhostText();
  }

  loadPreferences() {
    try {
      const saved = localStorage.getItem('rinawarp-terminal-prefs');
      if (saved) {
        const prefs = JSON.parse(saved);
        this.config = { ...this.config, ...prefs };
      }
    } catch (error) {
      console.warn('Failed to load terminal preferences:', error);
    }
  }

  savePreferences() {
    try {
      localStorage.setItem('rinawarp-terminal-prefs', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save terminal preferences:', error);
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Handle terminal-specific shortcuts
      if (this.activeTerminalId && this.terminals.has(this.activeTerminalId)) {
        const terminal = this.terminals.get(this.activeTerminalId);

        // Ctrl+C - Interrupt current process
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
          e.preventDefault();
          this.sendInterrupt();
        }

        // Ctrl+D - Exit or logout
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
          e.preventDefault();
          this.sendEOF();
        }

        // Ctrl+L - Clear terminal
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
          e.preventDefault();
          terminal.clear();
        }

        // Ctrl+A - Move to beginning of line
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
          e.preventDefault();
          terminal.focus();
        }

        // Ctrl+E - Move to end of line
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
          e.preventDefault();
          terminal.focus();
        }
      }
    });
  }

  initializeGhostText() {
    // Wait for DOM to be ready
    setTimeout(() => {
      this.setupGhostTextLayer();
    }, 100);
  }

  setupGhostTextLayer() {
    // Create ghost text layer
    const ghostLayer = document.createElement('div');
    ghostLayer.id = 'ghost-text-layer';
    ghostLayer.style.cssText = `
            position: absolute;
            pointer-events: none;
            z-index: 1000;
            font-family: 'JetBrains Mono, Fira Code, Monaco, Cascadia Code, monospace';
            font-size: 14px;
            color: #6a737d;
            white-space: pre;
        `;
    document.body.appendChild(ghostLayer);
  }

  updateGhostSuggestion(command) {
    this.ghostSuggestion = getV1Suggestion(command) || '';

    if (this.ghostSuggestion) {
      this.renderGhostText(this.ghostSuggestion);
    } else {
      this.clearGhostText();
    }
  }

  renderGhostText(suggestion) {
    const ghostLayer = document.getElementById('ghost-text-layer');
    if (!ghostLayer || !this.inputEl) return;

    const cursorPos = this.getCursorPosition();
    if (cursorPos) {
      ghostLayer.style.left = cursorPos.left + 'px';
      ghostLayer.style.top = cursorPos.top + 'px';
      ghostLayer.innerHTML = `<span class="ghost-text-suggestion">${suggestion}</span>`;
    }
  }

  clearGhostText() {
    const ghostLayer = document.getElementById('ghost-text-layer');
    if (ghostLayer) {
      ghostLayer.innerHTML = '';
    }
  }

  getCursorPosition() {
    if (!this.inputEl) return null;

    const rect = this.inputEl.getBoundingClientRect();

    return {
      left: rect.left + 10,
      top: rect.top + 10,
    };
  }

  handleGhostTextAccept() {
    if (!this.ghostSuggestion || !this.inputEl) return;

    // Apply suggestion
    this.inputEl.value = this.ghostSuggestion;
    this.ghostSuggestion = '';
    this.clearGhostText();

    // Dispatch Enter key to execute
    this.inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    // Update session state
    if (window.sessionState) {
      window.sessionState.acceptedSuggestions++;
    }
  }

  createTerminal(options = {}) {
    if (this.terminals.size >= this.config.maxTerminals) {
      this.showError('Maximum number of terminals reached');
      return null;
    }

    const terminalId = `terminal-${++this.terminalCounter}`;
    const terminalOptions = {
      ...this.config,
      ...options,
    };

    // Create terminal instance
    const terminal = new Terminal(terminalOptions);

    // Load and setup addons
    this.setupTerminalAddons(terminal);

    // Create terminal container
    const container = this.createTerminalContainer(terminalId);

    // Open terminal in container
    terminal.open(container.querySelector('.terminal-content'));

    // Setup terminal events
    this.setupTerminalEvents(terminal, terminalId);

    // Start shell process
    this.startShellProcess(terminal, terminalId);

    // Store terminal
    this.terminals.set(terminalId, {
      terminal,
      container,
      shell: null,
      cwd: '/',
      started: Date.now(),
    });

    // Create tab
    this.createTerminalTab(terminalId);

    // Set as active
    this.setActiveTerminal(terminalId);

    // Focus terminal
    terminal.focus();

    return terminalId;
  }

  setupTerminalAddons(terminal) {
    try {
      // Fit addon
      if (this.loadedAddons.has('fit') && typeof FitAddon !== 'undefined') {
        const fitAddon = new FitAddon.FitAddon();
        terminal.loadAddon(fitAddon);
        terminal.fitAddon = fitAddon;
      }

      // Web links addon
      if (this.loadedAddons.has('web-links') && typeof WebLinksAddon !== 'undefined') {
        const webLinksAddon = new WebLinksAddon.WebLinksAddon();
        terminal.loadAddon(webLinksAddon);
      }

      // Search addon
      if (this.loadedAddons.has('search') && typeof SearchAddon !== 'undefined') {
        const searchAddon = new SearchAddon.SearchAddon();
        terminal.loadAddon(searchAddon);
        terminal.searchAddon = searchAddon;
      }
    } catch (error) {
      console.warn('Failed to setup terminal addons:', error);
    }
  }

  createTerminalContainer(terminalId) {
    const terminalContent = document.getElementById('terminal-content');

    const container = document.createElement('div');
    container.className = 'terminal-instance';
    container.id = `terminal-container-${terminalId}`;
    container.style.display = 'none';

    const content = document.createElement('div');
    content.className = 'terminal-content';

    container.appendChild(content);
    terminalContent.appendChild(container);

    return container;
  }

  setupTerminalEvents(terminal, terminalId) {
    // Handle terminal data
    terminal.onData((data) => {
      this.handleTerminalInput(terminalId, data);
    });

    // Handle cursor position changes
    terminal.onCursorMove(() => {
      this.updateTerminalActivity(terminalId);
    });

    // Handle key events
    terminal.onKey((event) => {
      this.handleTerminalKey(terminalId, event);
    });

    // Handle resize
    terminal.onResize((event) => {
      this.handleTerminalResize(terminalId, event);
    });

    // Handle title changes
    terminal.onTitleChange((title) => {
      this.updateTerminalTitle(terminalId, title);
    });
  }

  async startShellProcess(terminal, terminalId) {
    try {
      // Create terminal session via IPC
      const session = await window.electronAPI.invoke('create-terminal-session', terminalId, {
        cwd: '/',
      });

      if (session.success) {
        this.terminals.get(terminalId).shell = session.shell;

        // Write welcome message
        terminal.write('\r\n\x1b[36mRinaWarp Terminal Pro v1.0.0\x1b[0m\r\n');
        terminal.write(`Shell: ${session.shell}\r\n`);
        terminal.write('Welcome! Type "help" for available commands.\r\n\r\n');
      } else {
        throw new Error(session.error);
      }
    } catch (error) {
      console.error('Failed to start shell process:', error);
      terminal.write('\r\n\x1b[31mFailed to start shell process: ' + error.message + '\x1b[0m\r\n');
    }
  }

  createTerminalTab(terminalId) {
    const tabsContainer = document.getElementById('terminal-tabs');

    const tab = document.createElement('button');
    tab.className = 'terminal-tab';
    tab.id = `terminal-tab-${terminalId}`;
    tab.innerHTML = `
            <span class="icon">💻</span>
            <span class="title">Terminal ${this.terminalCounter}</span>
            <button class="close-btn" title="Close terminal">×</button>
        `;

    // Tab click handler
    tab.addEventListener('click', (e) => {
      if (!e.target.classList.contains('close-btn')) {
        this.setActiveTerminal(terminalId);
      }
    });

    // Close button handler
    tab.querySelector('.close-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeTerminal(terminalId);
    });

    tabsContainer.appendChild(tab);
  }

  setActiveTerminal(terminalId) {
    // Update tab states
    document.querySelectorAll('.terminal-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.id === `terminal-tab-${terminalId}`);
    });

    // Update container visibility
    document.querySelectorAll('.terminal-instance').forEach((container) => {
      container.style.display = 'none';
    });

    const container = document.getElementById(`terminal-container-${terminalId}`);
    if (container) {
      container.style.display = 'block';
    }

    this.activeTerminalId = terminalId;

    // Focus terminal
    const terminal = this.terminals.get(terminalId)?.terminal;
    if (terminal) {
      terminal.focus();
      this.fitTerminal(terminal);
    }

    // Update terminal list
    this.updateTerminalList();
  }

  fitTerminal(terminal) {
    if (terminal.fitAddon) {
      setTimeout(() => {
        terminal.fitAddon.fit();
      }, 100);
    }
  }

  async handleTerminalInput(terminalId, data) {
    const terminalInfo = this.terminals.get(terminalId);
    if (!terminalInfo || !terminalInfo.shell) return;

    // Update session state
    if (window.sessionState) {
      window.sessionState.commandsExecuted++;
    }

    // Send input to shell process via IPC
    try {
      await window.electronAPI.invoke('write-to-terminal', terminalId, data);
    } catch (error) {
      console.error('Failed to write to terminal:', error);
    }

    // Add to history
    this.addToHistory(terminalId, data);
  }

  handleTerminalKey(terminalId, event) {
    // Handle special key combinations
    const { domEvent } = event;

    // Tab completion - accept ghost text
    if (domEvent.key === 'Tab') {
      if (this.ghostSuggestion) {
        event.domEvent.preventDefault();
        this.handleGhostTextAccept();
        return;
      }
      this.handleTabCompletion();
    }

    // Command history navigation
    if (domEvent.key === 'ArrowUp' && domEvent.ctrlKey) {
      this.navigateHistory(terminalId, -1);
    }

    if (domEvent.key === 'ArrowDown' && domEvent.ctrlKey) {
      this.navigateHistory(terminalId, 1);
    }
  }

  async handleTerminalResize(terminalId, event) {
    const terminalInfo = this.terminals.get(terminalId);
    if (terminalInfo && terminalInfo.shell) {
      try {
        await window.electronAPI.invoke('resize-terminal', terminalId, event.cols, event.rows);
      } catch (error) {
        console.error('Failed to resize terminal:', error);
      }
    }
  }

  handleInterrupt() {
    if (this.activeTerminalId) {
      this.sendSignal(this.activeTerminalId, 'SIGINT');
    }
  }

  sendInterrupt() {
    this.handleInterrupt();
  }

  sendEOF() {
    if (this.activeTerminalId) {
      this.sendSignal(this.activeTerminalId, 'EOF');
    }
  }

  async sendSignal(terminalId, signal) {
    const terminalInfo = this.terminals.get(terminalId);
    if (terminalInfo && terminalInfo.shell) {
      if (signal === 'SIGINT') {
        // Send Ctrl+C via terminal input
        await this.handleTerminalInput(terminalId, '\x03');
      } else if (signal === 'EOF') {
        // Send Ctrl+D via terminal input
        await this.handleTerminalInput(terminalId, '\x04');
      }
    }
  }

  handleTabCompletion() {
    // Implement tab completion logic
    // This would typically involve reading current line and suggesting completions
    console.log('Tab completion requested');
  }

  addToHistory(terminalId, input) {
    if (input.trim()) {
      this.terminalHistory.push({
        terminalId,
        input: input.trim(),
        timestamp: Date.now(),
      });

      // Trim history if too large
      if (this.terminalHistory.length > this.maxHistorySize) {
        this.terminalHistory.shift();
      }
    }
  }

  navigateHistory(terminalId, direction) {
    // Implement command history navigation
    const terminal = this.terminals.get(terminalId)?.terminal;
    if (!terminal) return;

    // This would involve tracking current history position and updating the terminal buffer
    console.log(`History navigation: ${direction}`);
  }

  updateTerminalTitle(terminalId, title) {
    const tab = document.getElementById(`terminal-tab-${terminalId}`);
    if (tab && title) {
      const titleSpan = tab.querySelector('.title');
      if (titleSpan) {
        titleSpan.textContent = title;
      }
    }
  }

  updateTerminalActivity(terminalId) {
    // Update activity indicators
    const tab = document.getElementById(`terminal-tab-${terminalId}`);
    if (tab) {
      tab.classList.add('active');
    }
  }

  updateTerminalList() {
    const terminalList = document.getElementById('terminal-list');
    if (!terminalList) return;

    terminalList.innerHTML = '';

    this.terminals.forEach((terminalInfo, terminalId) => {
      const item = document.createElement('div');
      item.className = 'terminal-item';
      item.innerHTML = `
                <span class="terminal-icon">💻</span>
                <span class="terminal-name">Terminal ${terminalId.split('-')[1]}</span>
                <span class="terminal-status">${terminalInfo.shell ? 'Running' : 'Stopped'}</span>
            `;

      item.addEventListener('click', () => {
        this.setActiveTerminal(terminalId);
      });

      terminalList.appendChild(item);
    });
  }

  async closeTerminal(terminalId) {
    const terminalInfo = this.terminals.get(terminalId);
    if (!terminalInfo) return;

    // Close terminal session via IPC
    try {
      await window.electronAPI.invoke('close-terminal-session', terminalId);
    } catch (error) {
      console.error('Failed to close terminal session:', error);
    }

    // Dispose terminal
    terminalInfo.terminal.dispose();

    // Remove from storage
    this.terminals.delete(terminalId);

    // Remove tab
    const tab = document.getElementById(`terminal-tab-${terminalId}`);
    if (tab) {
      tab.remove();
    }

    // Remove container
    const container = document.getElementById(`terminal-container-${terminalId}`);
    if (container) {
      container.remove();
    }

    // Set new active terminal if needed
    if (this.activeTerminalId === terminalId) {
      const remaining = Array.from(this.terminals.keys());
      if (remaining.length > 0) {
        this.setActiveTerminal(remaining[0]);
      } else {
        this.activeTerminalId = null;
      }
    }

    this.updateTerminalList();
  }

  closeActiveTerminal() {
    if (this.activeTerminalId) {
      this.closeTerminal(this.activeTerminalId);
    }
  }

  handleResize() {
    // Fit all terminals to their containers
    this.terminals.forEach(({ terminal }) => {
      this.fitTerminal(terminal);
    });
  }

  writeToTerminal(terminalId, data) {
    const terminal = this.terminals.get(terminalId)?.terminal;
    if (terminal) {
      terminal.write(data);
    }
  }

  clearTerminal(terminalId) {
    const terminal = this.terminals.get(terminalId)?.terminal;
    if (terminal) {
      terminal.clear();
    }
  }

  selectAll(terminalId) {
    const terminal = this.terminals.get(terminalId)?.terminal;
    if (terminal) {
      terminal.selectAll();
    }
  }

  copySelection(terminalId) {
    const terminal = this.terminals.get(terminalId)?.terminal;
    if (terminal) {
      terminal.copySelection();
    }
  }

  paste(terminalId, data) {
    const terminal = this.terminals.get(terminalId)?.terminal;
    if (terminal) {
      terminal.paste(data);
    }
  }

  findInTerminal(terminalId, searchTerm) {
    const terminal = this.terminals.get(terminalId)?.terminal;
    if (terminal && terminal.searchAddon) {
      terminal.searchAddon.findNext(searchTerm);
    }
  }

  changeDirectory(terminalId, path) {
    const terminalInfo = this.terminals.get(terminalId);
    if (terminalInfo) {
      terminalInfo.cwd = path;
    }
  }

  showError(message) {
    if (window.electronAPI) {
      window.electronAPI.showMessageBox({
        type: 'error',
        title: 'Terminal Error',
        message: message,
      });
    }
  }

  // Public API
  getActiveTerminal() {
    return this.activeTerminalId ? this.terminals.get(this.activeTerminalId) : null;
  }

  getTerminalCount() {
    return this.terminals.size;
  }

  getAllTerminals() {
    return Array.from(this.terminals.entries());
  }
}

// Export for use in main application
window.TerminalManager = TerminalManager;
window.terminalManager = new TerminalManager();
