/**
 * Shared constants used across main/preload/renderer.
 * Keep this file stable; IPC names should not change casually.
 */
export const APP_NAME = 'RinaWarp Terminal Pro';
export const APP_ID = 'com.rinawarp.terminalpro';

export const IPC_CHANNELS = {
  POLICY_GET: 'policy:get',
  POLICY_SET: 'policy:set',
  RINA_HEALTH: 'rina:health',
  RINA_SMOKE_ROUNDTRIP: 'rina:smokeRoundTrip',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

// Security constants
export const SECURITY = {
  // Content Security Policy
  CSP: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:'],
    connectSrc: ["'self'", 'https://rinawarptech.com'],
    fontSrc: ["'self'", 'data:'],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
    baseUri: ["'none'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
  },

  // Allowed origins
  allowedOrigins: [
    'https://rinawarptech.com',
    'https://api.rinawarptech.com',
    'https://checkout.stripe.com',
    'https://billing.stripe.com',
  ],

  // File system restrictions
  restrictedPaths: [
    '/System',
    '/Windows',
    '/Program Files',
    '/Program Files (x86)',
    '/AppData/Local/Microsoft',
    '/AppData/Roaming/Microsoft',
    'C:\\Windows',
    'C:\\Program Files',
    'C:\\Program Files (x86)',
  ],

  // Maximum file sizes
  maxFileSizes: {
    text: 10 * 1024 * 1024, // 10MB
    image: 5 * 1024 * 1024, // 5MB
    audio: 50 * 1024 * 1024, // 50MB
    video: 100 * 1024 * 1024, // 100MB
  },
};

// Theme constants
export const THEMES = {
  light: {
    name: 'Light',
    colors: {
      primary: '#007acc',
      secondary: '#6c757d',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      info: '#17a2b8',

      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#212529',
      textSecondary: '#6c757d',
      border: '#dee2e6',

      conversation: {
        userBubble: '#007acc',
        agentBubble: '#f8f9fa',
        userText: '#ffffff',
        agentText: '#212529',
      },

      terminal: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        selection: '#264f78',
      },
    },
  },

  dark: {
    name: 'Dark',
    colors: {
      primary: '#007acc',
      secondary: '#6c757d',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      info: '#17a2b8',

      background: '#1a1a1a',
      surface: '#2d2d2d',
      text: '#e0e0e0',
      textSecondary: '#a0a0a0',
      border: '#404040',

      conversation: {
        userBubble: '#007acc',
        agentBubble: '#2d2d2d',
        userText: '#ffffff',
        agentText: '#e0e0e0',
      },

      terminal: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        selection: '#264f78',
      },
    },
  },
} as const;

// Event names
export const EVENTS = {
  // Application events
  APP_READY: 'app:ready',
  APP_QUIT: 'app:quit',
  WINDOW_READY: 'window:ready',
  WINDOW_CLOSED: 'window:closed',

  // Conversation events
  CONVERSATION_STARTED: 'conversation:started',
  MESSAGE_SENT: 'message:sent',
  MESSAGE_RECEIVED: 'message:received',
  INTENT_DETECTED: 'intent:detected',
  ACTION_PROPOSED: 'action:proposed',
  ACTION_EXECUTED: 'action:executed',

  // Agent events
  AGENT_CONNECTED: 'agent:connected',
  AGENT_DISCONNECTED: 'agent:disconnected',
  AGENT_ERROR: 'agent:error',

  // Terminal events
  TERMINAL_CREATED: 'terminal:created',
  TERMINAL_OUTPUT: 'terminal:output',
  TERMINAL_EXIT: 'terminal:exit',

  // Security events
  PERMISSION_REQUESTED: 'permission:requested',
  PERMISSION_GRANTED: 'permission:granted',
  PERMISSION_DENIED: 'permission:denied',
  SECURITY_VIOLATION: 'security:violation',
} as const;

export type AppConfig = typeof APP_CONFIG;
export type IPCChannels = typeof IPC_CHANNELS;
export type SecurityConfig = typeof SECURITY;
export type ThemeConfig = typeof THEMES;
export type Events = typeof EVENTS;
