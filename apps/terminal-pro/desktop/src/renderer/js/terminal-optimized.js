/**
 * RinaWarp Terminal Pro - Optimized Terminal Management
 * Enhanced for performance and memory efficiency
 */

class OptimizedTerminalManager {
    constructor() {
        this.terminals = new Map();
        this.activeTerminalId = null;
        this.terminalCounter = 0;
        this.terminalHistory = new Map(); // Use Map for better memory management
        this.maxHistorySize = 100;
        this.maxTerminals = 20; // Hard limit to prevent memory issues
        
        // Performance optimizations
        this.eventListeners = new Map();
        this.performanceMetrics = {
            memoryUsage: 0,
            terminalCount: 0,
            averageResponseTime: 0,
            totalCommands: 0
        };
        
        this.config = {
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Fira Code, Monaco, Cascadia Code, monospace',
            theme: 'mermaid',
            scrollback: 1000,
            cursorBlink: true,
            performanceMode: true,
            lazyLoadAddons: true,
            maxTerminals: 20
        };
        
        // Memory management
        this.cleanupInterval = null;
        this.memoryThreshold = 50 * 1024 * 1024; // 50MB
        this.gcThreshold = 0.8; // Trigger GC at 80% threshold
        
        this.initializeXterm();
        this.startPerformanceMonitoring();
    }

    initializeXterm() {
        // Use dynamic imports for better performance
        this.loadedAddons = new Set();
        this.xtermModule = null;
        this.addonModules = new Map();
    }

    async initialize() {
        try {
            // Preload critical dependencies
            await this.preloadDependencies();
            
            // Initialize terminal settings
            this.setupTerminalSettings();
            
            // Setup optimized IPC listeners
            this.setupOptimizedIPClisteners();
            
            // Start cleanup timer
            this.startCleanupTimer();
            
            console.log('Optimized Terminal Manager initialized');
        } catch (error) {
            console.error('Failed to initialize optimized terminal:', error);
            throw error;
        }
    }

    async preloadDependencies() {
        // Load core Xterm.js module
        if (!window.xtermLoaded) {
            await this.loadScriptOptimized('https://cdn.jsdelivr.net/npm/xterm@5.3.0/lib/xterm.js');
            window.xtermLoaded = true;
        }
        
        // Preload only essential addons
        await this.loadEssentialAddons();
    }

    async loadEssentialAddons() {
        const essentialAddons = ['fit']; // Load fit addon first as it's critical
        for (const addon of essentialAddons) {
            await this.loadAddonOptimized(addon);
        }
    }

    loadScriptOptimized(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true; // Load asynchronously
            script.onload = () => {
                resolve();
                // Trigger garbage collection if available
                if (window.gc) {
                    setTimeout(() => window.gc(), 100);
                }
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async loadAddonOptimized(addonName) {
        if (this.loadedAddons.has(addonName)) return;
        
        try {
            const addonUrl = `https://cdn.jsdelivr.net/npm/xterm-addon-${addonName}@0.8.0/lib/xterm-addon-${addonName}.js`;
            await this.loadScriptOptimized(addonUrl);
            this.loadedAddons.add(addonName);
            console.log(`Loaded addon: ${addonName}`);
        } catch (error) {
            console.warn(`Failed to load addon ${addonName}:`, error);
        }
    }

    setupOptimizedIPClisteners() {
        if (!window.electronAPI) return;

        // Use once listeners where possible to prevent memory leaks
        this.optimizedListener('terminal-output', (terminalId, data) => {
            const terminal = this.terminals.get(terminalId)?.terminal;
            if (terminal && this.isTerminalActive(terminalId)) {
                terminal.write(data);
                this.updatePerformanceMetrics('output');
            }
        });

        this.optimizedListener('terminal-error', (terminalId, data) => {
            const terminal = this.terminals.get(terminalId)?.terminal;
            if (terminal && this.isTerminalActive(terminalId)) {
                terminal.write('\x1b[31m' + data + '\x1b[0m');
                this.updatePerformanceMetrics('error');
            }
        });

        this.optimizedListener('terminal-exit', (terminalId, code) => {
            this.handleTerminalExit(terminalId, code);
        });
    }

    optimizedListener(channel, callback) {
        if (window.electronAPI) {
            // Store reference for cleanup
            const listenerWrapper = (event, ...args) => callback(...args);
            this.eventListeners.set(channel, listenerWrapper);
            window.electronAPI.on(channel, listenerWrapper);
        }
    }

    isTerminalActive(terminalId) {
        return this.activeTerminalId === terminalId && this.terminals.has(terminalId);
    }

    startPerformanceMonitoring() {
        // Monitor memory usage and performance metrics
        setInterval(() => {
            this.collectPerformanceMetrics();
        }, 5000); // Every 5 seconds
    }

    collectPerformanceMetrics() {
        if (performance.memory) {
            this.performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize;
        }
        
        this.performanceMetrics.terminalCount = this.terminals.size;
        
        // Trigger cleanup if memory usage is high
        if (this.performanceMetrics.memoryUsage > this.memoryThreshold) {
            this.performMemoryCleanup();
        }
    }

    updatePerformanceMetrics(operation) {
        this.performanceMetrics.totalCommands++;
        const now = performance.now();
        
        // Simple response time tracking
        if (!this.lastOperationTime) {
            this.lastOperationTime = now;
        } else {
            const delta = now - this.lastOperationTime;
            this.performanceMetrics.averageResponseTime = 
                (this.performanceMetrics.averageResponseTime + delta) / 2;
            this.lastOperationTime = now;
        }
    }

    startCleanupTimer() {
        this.cleanupInterval = setInterval(() => {
            this.performMemoryCleanup();
        }, 30000); // Every 30 seconds
    }

    performMemoryCleanup() {
        // Clean up old terminal history
        for (const [terminalId, history] of this.terminalHistory) {
            if (history.length > this.maxHistorySize) {
                const excess = history.length - this.maxHistorySize;
                history.splice(0, excess);
            }
        }

        // Clean up inactive terminals
        for (const [terminalId, terminalInfo] of this.terminals) {
            if (terminalInfo.inactive && Date.now() - terminalInfo.lastActivity > 300000) { // 5 minutes
                this.safeCloseTerminal(terminalId);
            }
        }

        // Force garbage collection if available
        if (window.gc && performance.memory && 
            performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit > this.gcThreshold) {
            window.gc();
        }
    }

    async createTerminal(options = {}) {
        if (this.terminals.size >= this.config.maxTerminals) {
            this.showError('Maximum number of terminals reached');
            return null;
        }

        const terminalId = `terminal-${++this.terminalCounter}`;
        
        try {
            // Create terminal instance with optimized settings
            const terminalOptions = {
                ...this.config,
                ...options,
                convertEol: true,
                scrollback: Math.min(this.config.scrollback, 1000), // Limit scrollback
                disableStdin: false,
                cursorStyle: 'block'
            };

            const terminal = new Terminal(terminalOptions);
            
            // Load addons on-demand
            await this.loadAddonsOnDemand(terminal);
            
            // Create and setup terminal
            const container = this.createOptimizedContainer(terminalId);
            terminal.open(container.querySelector('.terminal-content'));
            
            // Setup optimized event handlers
            this.setupOptimizedTerminalEvents(terminal, terminalId);
            
            // Start shell process
            await this.startShellProcess(terminal, terminalId);
            
            // Store terminal with metadata
            this.terminals.set(terminalId, {
                terminal,
                container,
                shell: null,
                cwd: process.cwd(),
                started: Date.now(),
                lastActivity: Date.now(),
                inactive: false,
                commandCount: 0
            });
            
            // Initialize terminal history
            this.terminalHistory.set(terminalId, []);
            
            // Create optimized tab
            this.createOptimizedTab(terminalId, terminal);
            this.setActiveTerminal(terminalId);
            
            return terminalId;
            
        } catch (error) {
            console.error('Failed to create terminal:', error);
            this.showError('Failed to create terminal: ' + error.message);
            return null;
        }
    }

    async loadAddonsOnDemand(terminal) {
        const addons = ['fit'];
        
        for (const addon of addons) {
            await this.loadAddonOptimized(addon);
            
            if (this.loadedAddons.has(addon)) {
                try {
                    switch (addon) {
                        case 'fit':
                            if (typeof FitAddon !== 'undefined') {
                                const fitAddon = new FitAddon.FitAddon();
                                terminal.loadAddon(fitAddon);
                                terminal.fitAddon = fitAddon;
                            }
                            break;
                    }
                } catch (error) {
                    console.warn(`Failed to load ${addon} addon:`, error);
                }
            }
        }
    }

    createOptimizedContainer(terminalId) {
        const terminalContent = document.getElementById('terminal-content');
        if (!terminalContent) return null;
        
        const container = document.createElement('div');
        container.className = 'terminal-instance';
        container.id = `terminal-container-${terminalId}`;
        container.style.display = 'none';
        
        // Use DocumentFragment for better performance
        const content = document.createElement('div');
        content.className = 'terminal-content';
        content.style.width = '100%';
        content.style.height = '100%';
        
        container.appendChild(content);
        terminalContent.appendChild(container);
        
        return container;
    }

    setupOptimizedTerminalEvents(terminal, terminalId) {
        // Use passive event listeners where possible
        terminal.onData((data) => {
            this.handleTerminalInput(terminalId, data);
        });
        
        terminal.onCursorMove(() => {
            this.updateTerminalActivity(terminalId);
        });
        
        terminal.onKey((event) => {
            this.handleTerminalKey(terminalId, event);
        });
        
        terminal.onResize((event) => {
            this.handleTerminalResize(terminalId, event);
        });
        
        terminal.onTitleChange((title) => {
            this.updateTerminalTitle(terminalId, title);
        });
    }

    async startShellProcess(terminal, terminalId) {
        try {
            const session = await window.electronAPI.invoke('create-terminal-session', terminalId, {
                cwd: process.cwd()
            });
            
            if (session.success) {
                const terminalInfo = this.terminals.get(terminalId);
                if (terminalInfo) {
                    terminalInfo.shell = session.shell;
                }
                
                // Optimized welcome message
                terminal.write('\r\n\x1b[36mRinaWarp Terminal Pro v1.0.0\x1b[0m\r\n');
                terminal.write('Enhanced with performance optimizations\r\n\r\n');
            } else {
                throw new Error(session.error);
            }
            
        } catch (error) {
            console.error('Failed to start shell process:', error);
            terminal.write('\r\n\x1b[31mFailed to start shell process: ' + error.message + '\x1b[0m\r\n');
        }
    }

    createOptimizedTab(terminalId, terminal) {
        const tabsContainer = document.getElementById('terminal-tabs');
        if (!tabsContainer) return;
        
        const tab = document.createElement('button');
        tab.className = 'terminal-tab';
        tab.id = `terminal-tab-${terminalId}`;
        
        // Use textContent instead of innerHTML for security and performance
        const icon = document.createElement('span');
        icon.className = 'icon';
        icon.textContent = '💻';
        
        const title = document.createElement('span');
        title.className = 'title';
        title.textContent = `Terminal ${this.terminalCounter}`;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.title = 'Close terminal';
        closeBtn.textContent = '×';
        
        tab.appendChild(icon);
        tab.appendChild(title);
        tab.appendChild(closeBtn);
        
        // Use event delegation for better performance
        tab.addEventListener('click', (e) => {
            if (!e.target.classList.contains('close-btn')) {
                this.setActiveTerminal(terminalId);
            }
        });
        
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeTerminal(terminalId);
        });
        
        tabsContainer.appendChild(tab);
    }

    setActiveTerminal(terminalId) {
        // Update tab states efficiently
        const tabs = document.querySelectorAll('.terminal-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.id === `terminal-tab-${terminalId}`);
        });
        
        // Update container visibility
        const containers = document.querySelectorAll('.terminal-instance');
        containers.forEach(container => {
            container.style.display = 'none';
        });
        
        const container = document.getElementById(`terminal-container-${terminalId}`);
        if (container) {
            container.style.display = 'block';
        }
        
        this.activeTerminalId = terminalId;
        
        // Focus and fit terminal
        const terminalInfo = this.terminals.get(terminalId);
        if (terminalInfo) {
            terminalInfo.terminal.focus();
            terminalInfo.lastActivity = Date.now();
            terminalInfo.inactive = false;
            
            this.fitTerminal(terminalInfo.terminal);
        }
        
        // Update terminal list efficiently
        this.updateTerminalListOptimized();
    }

    updateTerminalListOptimized() {
        const terminalList = document.getElementById('terminal-list');
        if (!terminalList) return;
        
        // Clear existing content efficiently
        while (terminalList.firstChild) {
            terminalList.removeChild(terminalList.firstChild);
        }
        
        // Use DocumentFragment for batch updates
        const fragment = document.createDocumentFragment();
        
        this.terminals.forEach((terminalInfo, terminalId) => {
            const item = document.createElement('div');
            item.className = 'terminal-item';
            
            const icon = document.createElement('span');
            icon.className = 'terminal-icon';
            icon.textContent = '💻';
            
            const name = document.createElement('span');
            name.className = 'terminal-name';
            name.textContent = `Terminal ${terminalId.split('-')[1]}`;
            
            const status = document.createElement('span');
            status.className = 'terminal-status';
            status.textContent = terminalInfo.shell ? 'Running' : 'Stopped';
            
            item.appendChild(icon);
            item.appendChild(name);
            item.appendChild(status);
            
            item.addEventListener('click', () => {
                this.setActiveTerminal(terminalId);
            });
            
            fragment.appendChild(item);
        });
        
        terminalList.appendChild(fragment);
    }

    async handleTerminalInput(terminalId, data) {
        const terminalInfo = this.terminals.get(terminalId);
        if (!terminalInfo || !terminalInfo.shell) return;
        
        // Update activity timestamp
        terminalInfo.lastActivity = Date.now();
        terminalInfo.inactive = false;
        terminalInfo.commandCount++;
        
        try {
            await window.electronAPI.invoke('write-to-terminal', terminalId, data);
            this.addToOptimizedHistory(terminalId, data);
        } catch (error) {
            console.error('Failed to write to terminal:', error);
        }
    }

    addToOptimizedHistory(terminalId, input) {
        if (!input.trim()) return;
        
        const history = this.terminalHistory.get(terminalId) || [];
        history.push({
            input: input.trim(),
            timestamp: Date.now()
        });
        
        // Trim history if too large
        if (history.length > this.maxHistorySize) {
            history.shift();
        }
        
        this.terminalHistory.set(terminalId, history);
    }

    updateTerminalActivity(terminalId) {
        const terminalInfo = this.terminals.get(terminalId);
        if (terminalInfo) {
            terminalInfo.lastActivity = Date.now();
            terminalInfo.inactive = false;
        }
        
        // Update activity indicator
        const tab = document.getElementById(`terminal-tab-${terminalId}`);
        if (tab) {
            tab.classList.add('active');
        }
    }

    async closeTerminal(terminalId) {
        const terminalInfo = this.terminals.get(terminalId);
        if (!terminalInfo) return;
        
        try {
            await window.electronAPI.invoke('close-terminal-session', terminalId);
        } catch (error) {
            console.error('Failed to close terminal session:', error);
        }
        
        this.safeCloseTerminal(terminalId);
    }

    safeCloseTerminal(terminalId) {
        const terminalInfo = this.terminals.get(terminalId);
        if (!terminalInfo) return;
        
        try {
            // Dispose terminal
            terminalInfo.terminal.dispose();
            
            // Remove from storage
            this.terminals.delete(terminalId);
            this.terminalHistory.delete(terminalId);
            
            // Remove DOM elements
            this.removeTerminalDOM(terminalId);
            
            // Set new active terminal
            if (this.activeTerminalId === terminalId) {
                const remaining = Array.from(this.terminals.keys());
                if (remaining.length > 0) {
                    this.setActiveTerminal(remaining[0]);
                } else {
                    this.activeTerminalId = null;
                }
            }
            
            this.updateTerminalListOptimized();
            
        } catch (error) {
            console.error('Error closing terminal:', error);
        }
    }

    removeTerminalDOM(terminalId) {
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
    }

    handleTerminalExit(terminalId, code) {
        const terminalInfo = this.terminals.get(terminalId);
        if (terminalInfo) {
            terminalInfo.terminal.write(`\r\n\r\nProcess exited with code ${code}\r\n`);
            terminalInfo.shell = null;
            terminalInfo.inactive = true;
        }
    }

    // Public API with performance monitoring
    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }

    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
            };
        }
        return null;
    }

    async cleanup() {
        // Clear intervals
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        
        // Remove event listeners
        this.eventListeners.forEach((listener, channel) => {
            if (window.electronAPI) {
                window.electronAPI.removeAllListeners(channel);
            }
        });
        this.eventListeners.clear();
        
        // Close all terminals
        for (const terminalId of Array.from(this.terminals.keys())) {
            await this.closeTerminal(terminalId);
        }
        
        // Clear all data structures
        this.terminals.clear();
        this.terminalHistory.clear();
        this.loadedAddons.clear();
        this.addonModules.clear();
        
        console.log('Terminal Manager cleaned up');
    }

    showError(message) {
        if (window.electronAPI) {
            window.electronAPI.showMessageBox({
                type: 'error',
                title: 'Terminal Error',
                message: message
            });
        }
    }
}

// Export optimized terminal manager
window.OptimizedTerminalManager = OptimizedTerminalManager;
window.optimizedTerminalManager = new OptimizedTerminalManager();