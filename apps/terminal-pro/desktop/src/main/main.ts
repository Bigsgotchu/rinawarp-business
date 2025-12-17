import { app, BrowserWindow, ipcMain, session } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import core modules
import { Application } from './core/app';
import { SecurityManager } from './core/security';
import { ConfigManager } from './core/config';
import { LifecycleManager } from './core/lifecycle';

// Import IPC handlers
import { ConversationHandler } from './ipc/conversation';
import { IntentHandler } from './ipc/intent';
import { TerminalHandler } from './ipc/terminal';
import { AgentHandler } from './ipc/agent';
import { LicenseHandler } from './ipc/license';
import { FilesystemHandler } from './ipc/filesystem';
import { AppHandler } from './ipc/app';

// Import agent management
import { AgentManager } from './agents/agent-manager';

// Import constants and types
import { APP_CONFIG } from '../../shared/constants';
import { AgentStatus } from '../../shared/types/conversation.types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class RinaWarpTerminalPro {
  private application: Application;
  private securityManager: SecurityManager;
  private configManager: ConfigManager;
  private lifecycleManager: LifecycleManager;
  private agentManager: AgentManager;

  private ipcHandlers: {
    conversation: ConversationHandler;
    intent: IntentHandler;
    terminal: TerminalHandler;
    agent: AgentHandler;
    license: LicenseHandler;
    filesystem: FilesystemHandler;
    app: AppHandler;
  };

  private mainWindow: BrowserWindow | null = null;

  constructor() {
    console.log(`🚀 Starting ${APP_CONFIG.name} v${APP_CONFIG.version}`);

    // Initialize core managers
    this.application = new Application();
    this.securityManager = new SecurityManager();
    this.configManager = new ConfigManager();
    this.lifecycleManager = new LifecycleManager();
    this.agentManager = new AgentManager();

    // Initialize IPC handlers
    this.ipcHandlers = {
      conversation: new ConversationHandler(),
      intent: new IntentHandler(),
      terminal: new TerminalHandler(),
      agent: new AgentHandler(),
      license: new LicenseHandler(),
      filesystem: new FilesystemHandler(),
      app: new AppHandler(),
    };
  }

  async initialize(): Promise<void> {
    try {
      // Initialize configuration
      await this.configManager.initialize();

      // Set up security
      this.securityManager.initialize();

      // Set up application lifecycle
      this.lifecycleManager.initialize();

      // Initialize agent manager
      await this.agentManager.initialize();

      // Register IPC handlers
      this.registerIPCHandlers();

      // Set up application event handlers
      this.setupEventHandlers();

      console.log('✅ Application initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      throw error;
    }
  }

  private registerIPCHandlers(): void {
    console.log('📡 Registering IPC handlers...');

    // Register all IPC handlers
    this.ipcHandlers.conversation.register(ipcMain);
    this.ipcHandlers.intent.register(ipcMain);
    this.ipcHandlers.terminal.register(ipcMain);
    this.ipcHandlers.agent.register(ipcMain);
    this.ipcHandlers.license.register(ipcMain);
    this.ipcHandlers.filesystem.register(ipcMain);
    this.ipcHandlers.app.register(ipcMain);

    console.log('✅ IPC handlers registered');
  }

  private setupEventHandlers(): void {
    // App ready event
    app.whenReady().then(() => this.onAppReady());

    // Window event handlers
    app.on('window-all-closed', () => this.onWindowAllClosed());
    app.on('activate', () => this.onActivate());

    // Before quit handler
    app.on('before-quit', (event) => this.onBeforeQuit(event));
  }

  private async onAppReady(): Promise<void> {
    console.log('🎯 App ready - creating main window');

    try {
      // Create main window
      this.mainWindow = await this.createMainWindow();

      // Set up window event handlers
      this.setupWindowEventHandlers();

      // Start agent manager
      await this.agentManager.start();

      console.log('✅ Main window created successfully');
    } catch (error) {
      console.error('❌ Failed to create main window:', error);
      app.exit(1);
    }
  }

  private async createMainWindow(): Promise<BrowserWindow> {
    const preloadPath = path.join(__dirname, '../shared/preload.js');

    const window = new BrowserWindow({
      width: APP_CONFIG.defaults.window.width,
      height: APP_CONFIG.defaults.window.height,
      minWidth: APP_CONFIG.defaults.window.minWidth,
      minHeight: APP_CONFIG.defaults.window.minHeight,
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
      titleBarStyle: 'hiddenInset',
      show: false,
      backgroundColor: '#1a1a1a',
    });

    // Set up security headers
    this.setupSecurityHeaders(window);

    // Load the appropriate URL
    const devServerUrl = (process.env as Record<string, string | undefined>)['VITE_DEV_SERVER_URL'];
    if (devServerUrl) {
      await window.loadURL(devServerUrl);
    } else {
      await window.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    return window;
  }

  private setupSecurityHeaders(window: BrowserWindow): void {
    // Set up Content Security Policy and other security headers
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      const headers = details.responseHeaders || {};

      // Add security headers
      headers['Cross-Origin-Opener-Policy'] = ['same-origin'];
      headers['Cross-Origin-Embedder-Policy'] = ['require-corp'];
      headers['Cross-Origin-Resource-Policy'] = ['same-origin'];
      headers['X-Content-Type-Options'] = ['nosniff'];
      headers['X-Frame-Options'] = ['DENY'];
      headers['X-XSS-Protection'] = ['1; mode=block'];
      headers['Referrer-Policy'] = ['strict-origin-when-cross-origin'];

      callback({ responseHeaders: headers });
    });

    // Block external navigation
    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  }

  private setupWindowEventHandlers(): void {
    if (!this.mainWindow) return;

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();

      // Focus the window
      if (this.mainWindow) {
        this.mainWindow.focus();
      }

      // Open dev tools in development
      if (APP_CONFIG.build.environment === 'development' && this.mainWindow) {
        this.mainWindow.webContents.openDevTools();
      }
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private onWindowAllClosed(): void {
    console.log('📱 All windows closed');

    // On macOS, keep app running even when all windows are closed
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }

  private onActivate(): void {
    console.log('🔄 App activated');

    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      this.onAppReady();
    }
  }

  private onBeforeQuit(event: Electron.Event): void {
    console.log('🚪 App quitting...');

    // Perform cleanup before quitting
    event.preventDefault();

    this.cleanup()
      .then(() => {
        app.quit();
      })
      .catch((error) => {
        console.error('❌ Error during cleanup:', error);
        app.quit();
      });
  }

  private async cleanup(): Promise<void> {
    console.log('🧹 Performing cleanup...');

    try {
      // Stop agent manager
      await this.agentManager.stop();

      // Save configuration
      await this.configManager.save();

      // Cleanup IPC handlers
      this.ipcHandlers.conversation.cleanup();
      this.ipcHandlers.intent.cleanup();
      this.ipcHandlers.terminal.cleanup();
      this.ipcHandlers.agent.cleanup();
      this.ipcHandlers.license.cleanup();
      this.ipcHandlers.filesystem.cleanup();
      this.ipcHandlers.app.cleanup();

      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      throw error;
    }
  }

  // Public methods for testing and external control
  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  public getAgentManager(): AgentManager {
    return this.agentManager;
  }

  public getConfigManager(): ConfigManager {
    return this.configManager;
  }

  public isInitialized(): boolean {
    return this.application.isInitialized();
  }
}

// Initialize and run the application
const rinaWarpApp = new RinaWarpTerminalPro();

// Start the application
rinaWarpApp.initialize().catch((error) => {
  console.error('💥 Failed to start application:', error);
  process.exit(1);
});

// Handle unhandled errors
process.on('uncaughtException', (error: Error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default rinaWarpApp;
