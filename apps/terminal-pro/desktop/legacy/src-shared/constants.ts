// Application constants

// Get environment variable with fallback
const getEnv = (key: string, fallback: string): string => {
  return (process.env as Record<string, string | undefined>)[key] || fallback;
};

export const APP_CONFIG = {
  name: 'RinaWarp Terminal Pro',
  version: '0.4.0',
  author: 'RinaWarp Technologies',
  description: 'Conversation-first terminal with AI assistant',

  // Build info
  build: {
    number: getEnv('BUILD_NUMBER', '0'),
    timestamp: Date.now(),
    environment: getEnv('NODE_ENV', 'development'),
  },

  // Paths
  paths: {
    userData: 'userData',
    logs: 'logs',
    cache: 'cache',
    config: 'config',
    temp: 'temp',
  },

  // Default configurations
  defaults: {
    window: {
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
    },

    conversation: {
      maxMessages: 1000,
      messageRetention: 30 * 24 * 60 * 60 * 1000, // 30 days
      typingTimeout: 5000,
    },

    terminal: {
      defaultCols: 80,
      defaultRows: 24,
      maxTerminals: 10,
      outputBuffer: 1000,
    },

    agent: {
      requestTimeout: 30000,
      healthCheckInterval: 60000,
      maxRetries: 3,
    },

    security: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxPathLength: 4096,
      allowedFileExtensions: [
        '.txt',
        '.md',
        '.json',
        '.js',
        '.ts',
        '.jsx',
        '.tsx',
        '.py',
        '.go',
        '.rs',
        '.java',
        '.cpp',
        '.c',
        '.h',
        '.hpp',
        '.cs',
        '.php',
        '.rb',
        '.sh',
        '.bash',
        '.zsh',
        '.fish',
        '.ps1',
        '.bat',
        '.cmd',
      ],
      blockedCommands: [
        'rm -rf /',
        'sudo rm -rf /',
        'format c:',
        'del /s',
        'mkfs',
        'dd if=',
        '> /dev/sda',
        'exec',
      ],
    },
  },

  // API endpoints
  api: {
    baseUrl: getEnv('RINAWARP_API_URL', 'https://api.rinawarptech.com'),
    agentUrl: getEnv('RINA_AGENT_URL', 'https://rinawarptech.com/api/agent'),
    licenseUrl: 'https://rinawarptech.com/api/license',
    billingUrl: 'https://rinawarptech.com/api/billing',
  },

  // Update servers
  updates: {
    stable: 'https://updates.rinawarp.dev/stable',
    beta: 'https://updates.rinawarp.dev/beta',
    nightly: 'https://updates.rinawarp.dev/nightly',
  },

  // Performance thresholds
  performance: {
    launchTime: 2000, // 2 seconds
    memoryLimit: 200, // 200MB
    responseTime: 1000, // 1 second
    bundleSize: 5 * 1024 * 1024, // 5MB
  },

  // UI settings
  ui: {
    themes: ['light', 'dark', 'auto'] as const,
    languages: ['en', 'es', 'fr', 'de', 'ja', 'zh'] as const,
    animations: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },

    // Z-index layers
    zIndex: {
      tooltip: 1000,
      modal: 1050,
      notification: 1100,
      contextMenu: 1150,
      overlay: 1200,
    },

    // Animation durations
    durations: {
      fast: 150,
      normal: 300,
      slow: 500,
      verySlow: 1000,
    },
  },

  // Error codes
  errors: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    FILE_NOT_FOUND: 'FILE_NOT_FOUND',
    INVALID_INPUT: 'INVALID_INPUT',
    AGENT_UNAVAILABLE: 'AGENT_UNAVAILABLE',
    TIMEOUT: 'TIMEOUT',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  } as const,

  // Log levels
  logLevels: ['debug', 'info', 'warn', 'error'] as const,

  // Feature flags
  features: {
    voiceCommands: getEnv('FEATURE_VOICE', 'false') === 'true',
    liveCollaboration: getEnv('FEATURE_COLLAB', 'false') === 'true',
    advancedTerminal: getEnv('FEATURE_ADVANCED_TERMINAL', 'false') === 'true',
    agentMemory: getEnv('FEATURE_AGENT_MEMORY', 'false') === 'true',
    fileSystem: getEnv('FEATURE_FILESYSTEM', 'true') === 'true',
    networkRequests: getEnv('FEATURE_NETWORK', 'true') === 'true',
  },
};

// IPC Channel constants
export const IPC_CHANNELS = {
  // Conversation
  CONVERSATION: {
    SEND_MESSAGE: 'conversation:send-message',
    MESSAGE_RECEIVED: 'conversation:message-received',
    GET_HISTORY: 'conversation:get-history',
    CLEAR_HISTORY: 'conversation:clear-history',
    TYPING_INDICATOR: 'conversation:typing-indicator',
    AGENT_STATUS: 'conversation:agent-status',
  },

  // Intent processing
  INTENT: {
    PROCESS: 'intent:process',
    PROPOSALS_READY: 'intent:proposals-ready',
    EXECUTE_ACTION: 'intent:execute-action',
    EXECUTION_RESULT: 'intent:execution-result',
    EXECUTION_ERROR: 'intent:execution-error',
  },

  // Terminal
  TERMINAL: {
    CREATE: 'terminal:create',
    WRITE: 'terminal:write',
    RESIZE: 'terminal:resize',
    KILL: 'terminal:kill',
    OUTPUT: 'terminal:output',
    EXIT: 'terminal:exit',
    PROPOSE_EXEC: 'terminal:propose-exec',
    APPROVE_EXEC: 'terminal:approve-exec',
    DATA: 'terminal:data',
    EXIT_EVENT: 'terminal:exit-event',
  },

  // Agent
  AGENT: {
    SEND: 'agent:send',
    RESPONSE: 'agent:response',
    REQUEST_STATUS: 'agent:request-status',
    HEALTH_UPDATE: 'agent:health-update',
    LOG: 'agent:log',
  },

  // License
  LICENSE: {
    VERIFY: 'license:verify',
    GET: 'license:get',
    CLEAR: 'license:clear',
    REFRESH: 'license:refresh',
  },

  // File system
  FILESYSTEM: {
    READ_TEXT: 'fs:read-text',
    WRITE_TEXT: 'fs:write-text',
    CREATE_DIR: 'fs:create-dir',
    LIST_DIR: 'fs:list-dir',
    DELETE: 'fs:delete',
  },

  // Application
  APP: {
    GET_VERSION: 'app:get-version',
    OPEN_EXTERNAL: 'app:open-external',
    SHOW_MESSAGE_BOX: 'app:show-message-box',
    GET_CONFIG: 'app:get-config',
    SET_CONFIG: 'app:set-config',
  },

  // Updates
  UPDATE: {
    CHECK: 'update:check',
    DOWNLOAD: 'update:download',
    INSTALL: 'update:install',
    STATUS: 'update:status',
  },

  // Policy
  POLICY: {
    GET: 'policy:get',
    SET: 'policy:set',
  },

  // Rina
  RINA: {
    HEALTH: 'rina:health',
    SMOKE_ROUNDTRIP: 'rina:smoke-roundtrip',
    SET_OFFLINE: 'rina:set-offline',
  },
} as const;

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
