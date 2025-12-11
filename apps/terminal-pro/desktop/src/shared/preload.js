const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getVersion: () => ipcRenderer.invoke('app-version'),

  // Dialog APIs
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),

  // File system operations
  executeCommand: (command, options) => ipcRenderer.invoke('execute-command', command, options),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
  
  // License management
  validateLicense: (licenseKey) => ipcRenderer.invoke('validate-license', licenseKey),
  getLicenseInfo: () => ipcRenderer.invoke('get-license-info'),
  purchaseLicense: (tier) => ipcRenderer.invoke('purchase-license', tier),

  // AI features
  getAICommandSuggestion: (naturalLanguage) => ipcRenderer.invoke('ai-command-suggestion', naturalLanguage),
  explainCode: (code, language) => ipcRenderer.invoke('explain-code', code, language),
  quickFix: (error, context) => ipcRenderer.invoke('quick-fix', error, context),

  // Voice commands
  startVoiceRecognition: () => ipcRenderer.invoke('start-voice-recognition'),
  stopVoiceRecognition: () => ipcRenderer.invoke('stop-voice-recognition'),

  // Terminal operations
  createTerminal: (options) => ipcRenderer.invoke('create-terminal', options),
  writeToTerminal: (terminalId, data) => ipcRenderer.invoke('write-terminal', terminalId, data),
  resizeTerminal: (terminalId, cols, rows) => ipcRenderer.invoke('resize-terminal', terminalId, cols, rows),
  
  // Enhanced terminal session management
  createTerminalSession: (terminalId, options) => ipcRenderer.invoke('create-terminal-session', terminalId, options),
  writeToTerminalSession: (terminalId, data) => ipcRenderer.invoke('write-to-terminal', terminalId, data),
  resizeTerminalSession: (terminalId, cols, rows) => ipcRenderer.invoke('resize-terminal', terminalId, cols, rows),
  closeTerminalSession: (terminalId) => ipcRenderer.invoke('close-terminal-session', terminalId),
  getTerminalInfo: (terminalId) => ipcRenderer.invoke('get-terminal-info', terminalId),

  // System information
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  getCurrentDirectory: () => ipcRenderer.invoke('get-current-directory'),
  changeDirectory: (path) => ipcRenderer.invoke('change-directory', path),

  // Menu events (from main process to renderer)
  onMenuEvent: (callback) => {
    ipcRenderer.on('menu-new-terminal', callback);
    ipcRenderer.on('menu-open-folder', callback);
    ipcRenderer.on('menu-close-terminal', callback);
    ipcRenderer.on('menu-ai-suggestions', callback);
    ipcRenderer.on('menu-voice-commands', callback);
    ipcRenderer.on('menu-explain-code', callback);
    ipcRenderer.on('menu-license', callback);
  },

  // Terminal events (from main process to renderer)
  on: (channel, callback) => {
    const validChannels = [
      'terminal-output',
      'terminal-error', 
      'terminal-exit',
      'menu-new-terminal',
      'menu-open-folder',
      'menu-close-terminal',
      'menu-ai-suggestions',
      'menu-voice-commands',
      'menu-explain-code',
      'menu-license'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),

  // Notification support
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),

  // Update checker
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),

  // Settings
  getSetting: (key) => ipcRenderer.invoke('get-setting', key),
  setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),

  // Network status
  isOnline: () => ipcRenderer.invoke('is-online'),

  // 🔹 new Rina chat API
  rinaChat: (payload) => ipcRenderer.invoke("rina:chat", payload),

  // 🔹 Rina layout persistence
  getRinaLayout: () => ipcRenderer.invoke("rina:get-layout"),
  setRinaLayout: (layoutUpdate) =>
    ipcRenderer.invoke("rina:set-layout", layoutUpdate),

  // 🔹 License plan access
  getLicensePlan: () => ipcRenderer.invoke("get-license-plan"),

  // 🔹 Billing and license management
  startUpgrade: (tier) => ipcRenderer.invoke("billing:start-upgrade", { tier }),
  refreshLicense: () => ipcRenderer.invoke("license:refresh"),

  // 🔹 Update functionality
  restartUpdate: () => ipcRenderer.invoke("update:restart"),
  onUpdateChecking: (cb) => ipcRenderer.on("update:checking", cb),
  onUpdateAvailable: (cb) => ipcRenderer.on("update:available", cb),
  onUpdateNone: (cb) => ipcRenderer.on("update:none", cb),
  onUpdateError: (cb) => ipcRenderer.on("update:error", (event, err) => cb(err)),
  onUpdateProgress: (cb) => ipcRenderer.on("update:progress", (event, data) => cb(data)),
  onUpdateDownloaded: (cb) => ipcRenderer.on("update:downloaded", cb)
});

// Add methods for changelog functionality
contextBridge.exposeInMainWorld("electronAPI", {
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  getReleaseNotes: () => ipcRenderer.invoke("get-release-notes"),
  ...window.electronAPI // Merge with existing methods
});

// New Rina Config API
contextBridge.exposeInMainWorld('RinaConfig', {
  getConfig: () => ipcRenderer.invoke("config:get"),
  setLicenseKey: (key) => ipcRenderer.invoke("config:setLicenseKey", key),
  clearLicense: () => ipcRenderer.invoke("config:clearLicense")
});

// New Rina License API
contextBridge.exposeInMainWorld('RinaLicense', {
  verify: (key) => ipcRenderer.invoke("license:verify", key)
});

// New Rina Agent API
contextBridge.exposeInMainWorld('RinaAgent', {
  ask: (promptOrPayload) => ipcRenderer.invoke("agent:ask", promptOrPayload),
  getStatus: () => ipcRenderer.invoke("agent:get-status"),
  checkNow: () => ipcRenderer.invoke("agent:check-now"),
  onStatus: (handler) => {
    ipcRenderer.on("agent:status", (_event, status) => handler(status));
  },
  onLog: (handler) => {
    ipcRenderer.on("agent:log", (_event, logEvent) => handler(logEvent));
  },
});

// Theme management
contextBridge.exposeInMainWorld('themeManager', {
  getCurrentTheme: () => ipcRenderer.invoke('get-current-theme'),
  setTheme: (themeName) => ipcRenderer.invoke('set-theme', themeName),
  getAvailableThemes: () => ipcRenderer.invoke('get-available-themes'),
});

// Feature flags based on license tier
contextBridge.exposeInMainWorld('featureFlags', {
  hasFeature: (feature) => ipcRenderer.invoke('has-feature', feature),
  isProUser: () => ipcRenderer.invoke('is-pro-user'),
  getLicenseTier: () => ipcRenderer.invoke('get-license-tier'),
});

// Add environment flag
contextBridge.exposeInMainWorld('isElectron', true);
contextBridge.exposeInMainWorld('isDevelopment', process.env.NODE_ENV === 'development');

// ──────────────── RinaTerminal Bridge ────────────────
contextBridge.exposeInMainWorld('RinaTerminal', {
  createTerminal: (options) =>
    ipcRenderer.invoke('terminal:create', options || {}),

  write: (id, data) =>
    ipcRenderer.invoke('terminal:write', { id, data }),

  resize: (id, cols, rows) =>
    ipcRenderer.invoke('terminal:resize', { id, cols, rows }),

  kill: (id) =>
    ipcRenderer.invoke('terminal:kill', { id }),

  onData: (callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on('terminal:data', handler);
    // return unsubscribe
    return () => ipcRenderer.removeListener('terminal:data', handler);
  },

  onExit: (callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on('terminal:exit', handler);
    // return unsubscribe
    return () => ipcRenderer.removeListener('terminal:exit', handler);
  },
});

contextBridge.exposeInMainWorld("RinaVoice", {
  start: () => ipcRenderer.invoke("voice:start"),
  stop: () => ipcRenderer.invoke("voice:stop"),
  onTranscript: (cb) => {
    ipcRenderer.on("voice:transcript", (_e, msg) => cb(msg));
  },
  onResponse: (cb) => {
    ipcRenderer.on("voice:response", (_e, msg) => cb(msg));
  }
});

// Add RinaSync bridge for cloud sync functionality
contextBridge.exposeInMainWorld("RinaSync", {
  save: (key, value) => ipcRenderer.invoke("sync:save", { key, value }),
  load: (key) => ipcRenderer.invoke("sync:load", { key })
});

// Add RinaTeam bridge for team collaboration features
contextBridge.exposeInMainWorld("RinaTeam", {
  createBillingSession: (teamId, seats) => ipcRenderer.invoke("team:create-billing-session", { teamId, seats }),
  getSeats: (teamId) => ipcRenderer.invoke("team:get-seats", { teamId }),
  createSharedSession: (teamId, sessionName) => ipcRenderer.invoke("team:create-shared-session", { teamId, sessionName }),
  joinSession: (sessionId) => ipcRenderer.invoke("team:join-session", { sessionId }),
  getActivity: (teamId, limit) => ipcRenderer.invoke("team:get-activity", { teamId, limit }),
  storeAIMemory: (teamId, memoryType, content, tags) => ipcRenderer.invoke("team:store-ai-memory", { teamId, memoryType, content, tags }),
  searchMemory: (teamId, query, memoryType, limit) => ipcRenderer.invoke("team:search-memory", { teamId, query, memoryType, limit })
});

// 🔹 RinaAuth bridge for live sessions
contextBridge.exposeInMainWorld("RinaAuth", {
  async getToken() {
    return await ipcRenderer.invoke("auth:getToken");
  },
});