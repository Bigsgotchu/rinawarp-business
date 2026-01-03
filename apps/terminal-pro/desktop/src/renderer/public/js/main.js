import { UpdateBanner } from "./UpdateBanner.js";
import { initCommandPalette } from './command-palette.js';
import { initVoiceMode } from './voice.js';
import Onboarding from './onboarding.js';

// Initialize Sentry in renderer
if (window.RINA_ENV?.SENTRY_DSN) {
  import("@sentry/electron/renderer").then((SentryRenderer) => {
    SentryRenderer.init({
      dsn: window.RINA_ENV.SENTRY_DSN,
      tracesSampleRate: 0.2,
    });
  });
}
// RinaTerminalUI.initTerminal is already self-initialized in terminal-optimized.js

/**
 * RinaWarp Terminal Pro - Main Application Entry Point
 */

class RinaWarpApp {
    constructor() {
        this.isInitialized = false;
        this.config = {
            maxTerminals: 10,
            aiEnabled: true,
            voiceEnabled: true,
            theme: 'mermaid'
        };
        
        this.initializeApp();
    }

    async initializeApp() {
        try {
            // Show loading screen
            this.showLoadingScreen();

            // Check if we need to show license gate
            await this.checkLicenseGate();

            // Initialize core components
            await this.initializeComponents();

            // Setup event listeners
            this.setupEventListeners();

            // Check license status
            await this.checkLicenseStatus();

            // Initialize UI
            this.initializeUI();

            // Hide loading screen and show app
            this.hideLoadingScreen();

            this.isInitialized = true;
            console.log('RinaWarp Terminal Pro initialized successfully');

        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize application. Please restart.');
        }
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        if (loadingScreen) loadingScreen.style.display = 'flex';
        if (app) app.style.display = 'none';
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (app) app.style.display = 'flex';
    }

    async initializeComponents() {
        // Initialize Terminal Manager
        if (window.terminalManager) {
            await window.terminalManager.initialize();
        }

        // Initialize AI Assistant
        if (window.aiAssistant) {
            await window.aiAssistant.initialize();
        }

        // Initialize Voice Controller
        if (window.voiceController) {
            await window.voiceController.initialize();
        }

        // Initialize License Manager
        if (window.licenseManager) {
            await window.licenseManager.initialize();
        }

        // Initialize Theme Manager
        if (window.themeManager) {
            await window.themeManager.initialize();
        }
    }

    setupEventListeners() {
        // Header button events
        this.bindHeaderButtons();
        
        // Menu events from main process
        this.bindMenuEvents();
        
        // Keyboard shortcuts
        this.bindKeyboardShortcuts();
        
        // Window events
        this.bindWindowEvents();
        
        // UI state management
        this.bindUIEvents();
    }

    bindHeaderButtons() {
        // AI button
        const aiBtn = document.getElementById('ai-btn');
        if (aiBtn) {
            aiBtn.addEventListener('click', () => this.showAIModal());
        }

        // Voice button
        const voiceBtn = document.getElementById('voice-btn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.showVoiceModal());
        }

        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }

        // User menu
        const userAvatar = document.getElementById('user-avatar');
        if (userAvatar) {
            userAvatar.addEventListener('click', () => this.showUserMenu());
        }
    }

    bindMenuEvents() {
        if (window.electronAPI && window.electronAPI.onMenuEvent) {
            window.electronAPI.onMenuEvent((event, data) => {
                this.handleMenuEvent(data);
            });
        }
    }

    bindKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        // CmdOrCtrl + T - New Terminal
        if ((e.metaKey || e.ctrlKey) && e.key === 't') {
          e.preventDefault();
          this.createNewTerminal();
        }
  
        // CmdOrCtrl + Shift + A - AI Features
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'A') {
          e.preventDefault();
          this.showAIModal();
        }
  
        // CmdOrCtrl + Shift + V - Voice Commands
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'V') {
          e.preventDefault();
          this.showVoiceModal();
        }
  
        // CmdOrCtrl + Shift + E - Explain Code
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'E') {
          e.preventDefault();
          this.showCodeExplanation();
        }
  
        // CmdOrCtrl + Alt + D - Toggle Debug Panel
        if ((e.metaKey || e.ctrlKey) && e.altKey && e.key === 'd') {
          e.preventDefault();
          import('./agent-debug.js').then(module => {
            module.agentDebug.toggle();
          });
        }
      });
    }

    bindWindowEvents() {
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });

        window.addEventListener('online', () => {
            this.updateConnectionStatus(true);
        });

        window.addEventListener('offline', () => {
            this.updateConnectionStatus(false);
        });
    }

    bindUIEvents() {
        // Sidebar tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSidebarTab(e.target.closest('.tab-btn').dataset.tab);
            });
        });

        // Terminal management
        const newTerminalBtn = document.getElementById('new-terminal-btn');
        if (newTerminalBtn) {
            newTerminalBtn.addEventListener('click', () => {
                this.createNewTerminal();
            });
        }
    }

    async checkLicenseStatus() {
        try {
            const licenseInfo = await window.licenseManager.getLicenseInfo();
            this.updateLicenseUI(licenseInfo);
        } catch (error) {
            console.error('Failed to check license status:', error);
        }
    }

    async checkLicenseGate() {
        // Check URL parameters for license gate flag
        const urlParams = new URLSearchParams(window.location.search);
        const showLicenseGate = urlParams.get('showLicenseGate') === 'true';

        if (showLicenseGate) {
            // Show license gate and prevent app initialization until license is accepted
            return new Promise((resolve) => {
                const licenseGate = new window.LicenseGate();
                licenseGate.initialize((licenseKey, licenseData) => {
                    // License accepted, continue with app initialization
                    console.log('License activated:', licenseKey);
                    resolve();
                });
            });
        }

        // Check if we have a valid license in config
        try {
            const config = await window.RinaConfig.getConfig();

            if (config.licenseKey) {
                // License exists, verify it
                const resp = await window.RinaLicense.verify(config.licenseKey);
                if (!resp.ok || !resp.result || !resp.result.valid) {
                    // Invalid license, show license gate
                    return new Promise((resolve) => {
                        const licenseGate = new window.LicenseGate();
                        licenseGate.initialize((licenseKey, licenseData) => {
                            resolve();
                        });
                    });
                }
            } else {
                // No license, show license gate
                return new Promise((resolve) => {
                    const licenseGate = new window.LicenseGate();
                    licenseGate.initialize((licenseKey, licenseData) => {
                        resolve();
                    });
                });
            }
        } catch (error) {
            console.error('License check failed, showing license gate:', error);
            return new Promise((resolve) => {
                const licenseGate = new window.LicenseGate();
                licenseGate.initialize((licenseKey, licenseData) => {
                    resolve();
                });
            });
        }
    }

    updateLicenseUI(licenseInfo) {
        const licenseTier = document.querySelector('.license-tier');
        const upgradeBtn = document.getElementById('upgrade-btn');

        if (licenseTier) {
            licenseTier.textContent = licenseInfo.tier || 'Free';
        }

        if (upgradeBtn) {
            upgradeBtn.style.display = licenseInfo.tier === 'Free' ? 'block' : 'none';
        }
    }

    initializeUI() {
        // Set initial theme
        this.applyTheme(this.config.theme);
        
        // Create initial terminal
        this.createNewTerminal();
        
        // Update connection status
        this.updateConnectionStatus(navigator.onLine);
    }

    applyTheme(themeName) {
        document.body.className = `theme-${themeName}`;
        window.themeManager?.setTheme(themeName);
    }

    updateConnectionStatus(isOnline) {
        const indicator = document.getElementById('connection-indicator');
        const statusText = document.getElementById('status-text');
        
        if (indicator && statusText) {
            if (isOnline) {
                indicator.className = 'indicator online';
                statusText.textContent = 'Connected';
            } else {
                indicator.className = 'indicator offline';
                statusText.textContent = 'Offline';
            }
        }
    }

    handleMenuEvent(event) {
        switch (event) {
            case 'menu-new-terminal':
                this.createNewTerminal();
                break;
            case 'menu-open-folder':
                this.openFolder();
                break;
            case 'menu-close-terminal':
                this.closeCurrentTerminal();
                break;
            case 'menu-ai-suggestions':
                this.showAIModal();
                break;
            case 'menu-voice-commands':
                this.showVoiceModal();
                break;
            case 'menu-explain-code':
                this.showCodeExplanation();
                break;
            case 'menu-license':
                this.showLicenseModal();
                break;
        }
    }

    createNewTerminal() {
        if (window.terminalManager) {
            window.terminalManager.createTerminal();
        }
    }

    closeCurrentTerminal() {
        if (window.terminalManager) {
            window.terminalManager.closeActiveTerminal();
        }
    }

    openFolder() {
        if (window.electronAPI) {
            window.electronAPI.showOpenDialog({
                properties: ['openDirectory']
            }).then(result => {
                if (!result.canceled && result.filePaths.length > 0) {
                    this.openDirectory(result.filePaths[0]);
                }
            });
        }
    }

    openDirectory(path) {
        // Update file tree and navigate to directory
        if (window.fileManager) {
            window.fileManager.openDirectory(path);
        }
    }

    showAIModal() {
        const modal = document.getElementById('ai-modal');
        if (modal) {
            modal.classList.add('show');
        }
    }

    showVoiceModal() {
        const modal = document.getElementById('voice-modal');
        if (modal) {
            modal.classList.add('show');
        }
    }

    showLicenseModal() {
        const modal = document.getElementById('license-modal');
        if (modal) {
            modal.classList.add('show');
        }
    }

    showSettings() {
        // Implement settings modal
        console.log('Settings clicked');
    }

    showUserMenu() {
        // Implement user menu dropdown
        console.log('User menu clicked');
    }

    showCodeExplanation() {
        // Implement code explanation feature
        console.log('Code explanation requested');
    }

    switchSidebarTab(tabName) {
        // Update tab button states
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update panel visibility
        document.querySelectorAll('.panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}-panel`);
        });
    }

    handleWindowResize() {
        // Handle window resize events
        if (window.terminalManager) {
            window.terminalManager.handleResize();
        }
    }

    showError(message) {
        if (window.electronAPI) {
            window.electronAPI.showMessageBox({
                type: 'error',
                title: 'RinaWarp Terminal Pro',
                message: message
            });
        }
    }

    // Public API methods
    getConfig() {
        return this.config;
    }

    isReady() {
        return this.isInitialized;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize update banner
  new UpdateBanner();

  // Initialize main app
  window.rinaWarpApp = new RinaWarpApp();

  // Initialize command palette
  initCommandPalette();

  // Initialize voice mode
  initVoiceMode();

  // Initialize terminal (already self-initialized in terminal-optimized.js)
  if (window.RinaTerminalUI) {
    window.RinaTerminalUI.initTerminal?.();
  }

  // Initialize agent status indicator
  import('./agent-status.js').then(module => {
    module.agentStatus.startAutoPing();
  });

  // Initialize demo mode
  import('./demo-mode.js').then(module => {
    const DemoMode = module.DemoMode;

    document.addEventListener("DOMContentLoaded", () => {
      const btn = document.getElementById("demo-mode-btn");
      if (!btn) return;

      btn.addEventListener("click", () => {
        if (DemoMode.isActive()) {
          DemoMode.stop();
          btn.textContent = "🎬 Demo Mode";
        } else {
          DemoMode.start();
          btn.textContent = "⏹ Stop Demo";
        }
      });
    });
  });

  // Initialize onboarding
  Onboarding.startIfNeeded();

  // Initialize academy
  import('./onboarding-academy.js').then(module => {
    module.initRinaAcademy();
  });

  // Initialize plugins
  import('./plugin-system.js').then(module => {
    module.loadBuiltInPlugins();
  });

  // Initialize feature gate
  import('./feature-gate.js').then(module => {
    module.initFeatureGate();
  });
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RinaWarpApp;
}