/**
 * ============================================================
 * ⚡ RinaWarp Terminal Pro - Full Terminal Integration Layer
 * ------------------------------------------------------------
 * Wires together:
 *  - RealTerminal (xterm-based terminal core)
 *  - Command blocks and workflows
 *  - AI manager and Electron bridge
 *  - Tab / session / split-pane support
 * ============================================================
 */

import { AdvancedAIManager } from '../ai/advanced-ai-manager.js';
import RealTerminal from './real-terminal.js';
import CommandBlocks from './command-blocks.js';
import Workflows from './workflows.js';
import FeatureLimits from '../features/feature-limits.js';
import SessionManager from './session-manager.js';
import TabManager from './tab-manager.js';
import SplitPanes from './split-panes.js';
import CommandPalette from './command-palette.js';

export default class TerminalIntegration {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;

    // Core terminal
    this.terminal = new RealTerminal(container, options.terminal);

    // Functional modules
    this.commandBlocks = new CommandBlocks(this.terminal);
    this.workflows = new Workflows(this.terminal);
    this.featureLimits = new FeatureLimits();
    this.sessionManager = new SessionManager(this.terminal);
    this.tabManager = new TabManager(this.terminal);
    this.splitPanes = new SplitPanes(this.terminal);
    this.commandPalette = new CommandPalette(this.terminal);

    // AI brain
    this.ai = AdvancedAIManager;

    // Initialize all systems
    this.initialize();
  }

  // ------------------------------------------------------------
  // Initialize full terminal integration
  // ------------------------------------------------------------
  initialize() {
    console.log('🧩 Initializing RinaWarp Terminal Integration...');
    this.terminal.init();
    this.sessionManager.restoreLastSession();
    this.commandPalette.init();
    this.ai.init?.();

    this.registerEvents();

    console.log('✅ RinaWarp Terminal Pro Integration loaded successfully');
  }

  // ------------------------------------------------------------
  // Register custom events and workflows
  // ------------------------------------------------------------
  registerEvents() {
    // Example: listen for AI requests
    this.terminal.on('ai:query', async (prompt) => {
      console.log('🤖 AI Query received:', prompt);
      const response = await this.ai.query(prompt);
      this.terminal.write(`\r\n🧠 ${response.result}\r\n`);
    });

    // Handle workflow triggers
    this.terminal.on('workflow:run', (workflowId) => {
      this.workflows.run(workflowId);
    });

    // Tab and pane management events
    this.terminal.on('tab:new', () => this.tabManager.createNewTab());
    this.terminal.on('split:new', () => this.splitPanes.addPane());

    // Backend health ping via Electron bridge
    if (window?.electronAPI) {
      window.electronAPI.getAppVersion().then((version) => {
        console.log(`💻 Electron bridge active — version ${version}`);
      });

      // Optional backend health check
      window.electronAPI
        .pingBackend?.()
        .then((res) => {
          if (res?.status === 'ok') {
            console.log('🟢 Backend connected:', res.data);
          } else {
            console.warn('⚠️ Backend unavailable:', res?.message);
          }
        })
        .catch(() => {});
    }
  }

  // ------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------
  runCommand(cmd) {
    this.terminal.write(`\r\n> ${cmd}\r\n`);
    this.commandBlocks.execute(cmd);
  }

  attachAI(override) {
    if (override) this.ai = override;
  }

  destroy() {
    this.terminal.dispose();
    this.tabManager.destroy();
    this.sessionManager.saveState();
    console.log('🧹 RinaWarp Terminal Integration destroyed.');
  }
}
