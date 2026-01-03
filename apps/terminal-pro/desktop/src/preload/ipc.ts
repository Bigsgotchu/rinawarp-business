// Preload IPC - Typed IPC exposure to renderer
// This module exposes only allowlisted IPC channels to the renderer process

import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc-map.js';

// Type-safe IPC renderer wrapper
const safeIpc = {
  // Config
  config: {
    get: () => ipcRenderer.invoke(IPC_CHANNELS.CONFIG.GET),
    setLicenseKey: (licenseKey: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.CONFIG.SET_LICENSE_KEY, licenseKey),
    clearLicense: () => ipcRenderer.invoke(IPC_CHANNELS.CONFIG.CLEAR_LICENSE),
  },

  // Auth
  auth: {
    getToken: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH.GET_TOKEN),
  },

  // License
  license: {
    getKey: () => ipcRenderer.invoke(IPC_CHANNELS.LICENSE.GET_KEY),
    verify: (licenseKey: string) => ipcRenderer.invoke(IPC_CHANNELS.LICENSE.VERIFY, licenseKey),
    refresh: () => ipcRenderer.invoke(IPC_CHANNELS.LICENSE.REFRESH),
    getPlan: () => ipcRenderer.invoke(IPC_CHANNELS.LICENSE.GET_PLAN),
  },

  // Agent
  agent: {
    ask: (payload: any) => ipcRenderer.invoke(IPC_CHANNELS.AGENT.ASK, payload),
    getStatus: () => ipcRenderer.invoke(IPC_CHANNELS.AGENT.GET_STATUS),
    checkNow: () => ipcRenderer.invoke(IPC_CHANNELS.AGENT.CHECK_NOW),
  },

  // Rina Chat
  rina: {
    chat: (payload: any) => ipcRenderer.invoke(IPC_CHANNELS.RINA.CHAT, payload),
    getLayout: () => ipcRenderer.invoke(IPC_CHANNELS.RINA.GET_LAYOUT),
    setLayout: (layoutUpdate: any) =>
      ipcRenderer.invoke(IPC_CHANNELS.RINA.SET_LAYOUT, layoutUpdate),
  },

  // Billing
  billing: {
    startUpgrade: (tier: string, email?: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.BILLING.START_UPGRADE, { tier, email }),
  },

  // Update
  update: {
    restart: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATE.RESTART),
    getChannel: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATE.GET_CHANNEL),
    setChannel: (channel: string) => ipcRenderer.invoke(IPC_CHANNELS.UPDATE.SET_CHANNEL, channel),
  },

  // App
  app: {
    getVersion: () => ipcRenderer.invoke(IPC_CHANNELS.APP.GET_VERSION),
    getReleaseNotes: () => ipcRenderer.invoke(IPC_CHANNELS.APP.GET_RELEASE_NOTES),
  },

  // Sync
  sync: {
    save: (key: string, value: any) => ipcRenderer.invoke(IPC_CHANNELS.SYNC.SAVE, { key, value }),
    load: (key: string) => ipcRenderer.invoke(IPC_CHANNELS.SYNC.LOAD, { key }),
  },

  // Team
  team: {
    createBillingSession: (teamId: string, seats: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.TEAM.CREATE_BILLING_SESSION, { teamId, seats }),
    getSeats: (teamId: string) => ipcRenderer.invoke(IPC_CHANNELS.TEAM.GET_SEATS, { teamId }),
    createSharedSession: (teamId: string, sessionName: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.TEAM.CREATE_SHARED_SESSION, { teamId, sessionName }),
    joinSession: (sessionId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.TEAM.JOIN_SESSION, { sessionId }),
    getActivity: (teamId: string, limit?: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.TEAM.GET_ACTIVITY, { teamId, limit }),
    storeAiMemory: (teamId: string, memoryType: string, content: string, tags: string[]) =>
      ipcRenderer.invoke(IPC_CHANNELS.TEAM.STORE_AI_MEMORY, { teamId, memoryType, content, tags }),
    searchMemory: (teamId: string, query: string, memoryType?: string, limit?: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.TEAM.SEARCH_MEMORY, { teamId, query, memoryType, limit }),
  },

  // Portal
  portal: {
    open: (teamId?: string) => ipcRenderer.invoke(IPC_CHANNELS.PORTAL.OPEN, { teamId }),
  },

  // Terminal
  terminal: {
    create: (options?: any) => ipcRenderer.invoke(IPC_CHANNELS.TERMINAL.CREATE, options),
    write: (id: string, data: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.TERMINAL.WRITE, { id, data }),
    resize: (id: string, cols: number, rows: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.TERMINAL.RESIZE, { id, cols, rows }),
    kill: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.TERMINAL.KILL, { id }),
  },

  // Voice
  voice: {
    start: () => ipcRenderer.invoke(IPC_CHANNELS.VOICE.START),
  },

  // WebSocket
  websocket: {
    startServer: () => ipcRenderer.invoke(IPC_CHANNELS.WEBSOCKET.START_SERVER),
    stopServer: () => ipcRenderer.invoke(IPC_CHANNELS.WEBSOCKET.STOP_SERVER),
    createSharedSession: (terminalId: string, sessionName: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.WEBSOCKET.CREATE_SHARED_SESSION, { terminalId, sessionName }),
    joinSharedSession: (sessionId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.WEBSOCKET.JOIN_SHARED_SESSION, { sessionId }),
    broadcastTerminalData: (sessionId: string, terminalId: string, data: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.WEBSOCKET.BROADCAST_TERMINAL_DATA, {
        sessionId,
        terminalId,
        data,
      }),
  },

  // Crash Recovery
  crashRecovery: {
    getStatus: () => ipcRenderer.invoke(IPC_CHANNELS.CRASH_RECOVERY.GET_STATUS),
    clear: () => ipcRenderer.invoke(IPC_CHANNELS.CRASH_RECOVERY.CLEAR),
  },

  // Conversation (new typed IPC)
  conversation: {
    sendMessage: (message: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.CONVERSATION.SEND_MESSAGE, message),
    getHistory: () => ipcRenderer.invoke(IPC_CHANNELS.CONVERSATION.GET_HISTORY),
    clearHistory: () => ipcRenderer.invoke(IPC_CHANNELS.CONVERSATION.CLEAR_HISTORY),
  },

  // Filesystem (new typed IPC)
  filesystem: {
    readText: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.FILESYSTEM.READ_TEXT, path),
    writeText: (path: string, content: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.FILESYSTEM.WRITE_TEXT, path, content),
    createDir: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.FILESYSTEM.CREATE_DIR, path),
  },

  // Intent (new typed IPC)
  intent: {
    process: (intent: string) => ipcRenderer.invoke(IPC_CHANNELS.INTENT.PROCESS, intent),
    executeAction: (action: string, params: any) =>
      ipcRenderer.invoke(IPC_CHANNELS.INTENT.EXECUTE_ACTION, action, params),
  },

  // App (new typed IPC)
  appNew: {
    getVersion: () => ipcRenderer.invoke(IPC_CHANNELS.APP_NEW.GET_VERSION),
    openExternal: (url: string) => ipcRenderer.invoke(IPC_CHANNELS.APP_NEW.OPEN_EXTERNAL, url),
    getConfig: () => ipcRenderer.invoke(IPC_CHANNELS.APP_NEW.GET_CONFIG),
    setConfig: (config: any) => ipcRenderer.invoke(IPC_CHANNELS.APP_NEW.SET_CONFIG, config),
  },

  // Policy IPC
  policy: {
    get: () => ipcRenderer.invoke('policy:get'),
    set: (mode: any) => ipcRenderer.invoke('policy:set', mode),
  },

  // Smoke test IPC
  smokeTest: {
    ping: () => ipcRenderer.invoke('app:ping'),
    rinaHealth: () => ipcRenderer.invoke('rina:health'),
  },

  // Agent (new typed IPC)
  agentNew: {
    send: (message: string) => ipcRenderer.invoke(IPC_CHANNELS.AGENT_NEW.SEND, message),
    requestStatus: () => ipcRenderer.invoke(IPC_CHANNELS.AGENT_NEW.REQUEST_STATUS),
  },

  // License (new typed IPC)
  licenseNew: {
    verify: (licenseKey: string) => ipcRenderer.invoke(IPC_CHANNELS.LICENSE_NEW.VERIFY, licenseKey),
    get: () => ipcRenderer.invoke(IPC_CHANNELS.LICENSE_NEW.GET),
    refresh: () => ipcRenderer.invoke(IPC_CHANNELS.LICENSE_NEW.REFRESH),
  },

  // Terminal (new typed IPC)
  terminalNew: {
    create: (options?: any) => ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_NEW.CREATE, options),
    write: (id: string, data: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_NEW.WRITE, id, data),
    kill: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_NEW.KILL, id),
    proposeExec: (command: string, cwd?: string, env?: Record<string, string>) =>
      ipcRenderer.invoke('terminal:propose-exec', { command, cwd, env }),
    approveExec: (terminalId: string, token: string) =>
      ipcRenderer.invoke('terminal:approve-exec', { terminalId, token }),
  },
};

// Expose to renderer via context bridge
contextBridge.exposeInMainWorld('electronAPI', safeIpc);

// Also expose IPC channels for debugging
contextBridge.exposeInMainWorld('ipcChannels', IPC_CHANNELS);

// Expose rinaWarp API for smoke testing
contextBridge.exposeInMainWorld('rinaWarp', {
  rinaHealth: async () => ipcRenderer.invoke('rina:health'),
  rinaSetOfflineMode: async (offline: boolean) =>
    ipcRenderer.invoke('rina:setOfflineMode', Boolean(offline)),
  rinaSmokeRoundTrip: async (prompt: string, offline: boolean) =>
    ipcRenderer.invoke('rina:smokeRoundTrip', {
      prompt: String(prompt),
      offline: Boolean(offline),
    }),
  policyGet: async () => ipcRenderer.invoke('policy:get'),
  policySet: async (mode: any) => ipcRenderer.invoke('policy:set', mode),
});
