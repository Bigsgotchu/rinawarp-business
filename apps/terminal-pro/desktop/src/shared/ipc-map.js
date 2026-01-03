// IPC Channel Map - Single source of truth for all IPC channels
// This ensures type safety and prevents unauthorized IPC access
export const IPC_CHANNELS = {
    // Config
    CONFIG: {
        GET: 'config:get',
        SET_LICENSE_KEY: 'config:setLicenseKey',
        CLEAR_LICENSE: 'config:clearLicense',
    },
    // Auth
    AUTH: {
        GET_TOKEN: 'auth:getToken',
    },
    // License
    LICENSE: {
        GET_KEY: 'license:getKey',
        VERIFY: 'license:verify',
        REFRESH: 'license:refresh',
        GET_PLAN: 'get-license-plan',
    },
    // Agent
    AGENT: {
        ASK: 'agent:ask',
        GET_STATUS: 'agent:get-status',
        CHECK_NOW: 'agent:check-now',
    },
    // Rina Chat
    RINA: {
        CHAT: 'rina:chat',
        GET_LAYOUT: 'rina:get-layout',
        SET_LAYOUT: 'rina:set-layout',
    },
    // Billing
    BILLING: {
        START_UPGRADE: 'billing:start-upgrade',
    },
    // Update
    UPDATE: {
        RESTART: 'update:restart',
        GET_CHANNEL: 'update:get-channel',
        SET_CHANNEL: 'update:set-channel',
    },
    // App
    APP: {
        GET_VERSION: 'get-app-version',
        GET_RELEASE_NOTES: 'get-release-notes',
    },
    // Sync
    SYNC: {
        SAVE: 'sync:save',
        LOAD: 'sync:load',
    },
    // Team
    TEAM: {
        CREATE_BILLING_SESSION: 'team:create-billing-session',
        GET_SEATS: 'team:get-seats',
        CREATE_SHARED_SESSION: 'team:create-shared-session',
        JOIN_SESSION: 'team:join-session',
        GET_ACTIVITY: 'team:get-activity',
        STORE_AI_MEMORY: 'team:store-ai-memory',
        SEARCH_MEMORY: 'team:search-memory',
    },
    // Portal
    PORTAL: {
        OPEN: 'portal:open',
    },
    // Terminal
    TERMINAL: {
        CREATE: 'terminal:create',
        WRITE: 'terminal:write',
        RESIZE: 'terminal:resize',
        KILL: 'terminal:kill',
    },
    // Voice
    VOICE: {
        START: 'voice:start',
    },
    // WebSocket
    WEBSOCKET: {
        START_SERVER: 'websocket:start-server',
        STOP_SERVER: 'websocket:stop-server',
        CREATE_SHARED_SESSION: 'websocket:create-shared-session',
        JOIN_SHARED_SESSION: 'websocket:join-shared-session',
        BROADCAST_TERMINAL_DATA: 'websocket:broadcast-terminal-data',
    },
    // Crash Recovery
    CRASH_RECOVERY: {
        GET_STATUS: 'crash-recovery:get-status',
        CLEAR: 'crash-recovery:clear',
    },
    // Conversation (new typed IPC)
    CONVERSATION: {
        SEND_MESSAGE: 'conversation:send-message',
        GET_HISTORY: 'conversation:get-history',
        CLEAR_HISTORY: 'conversation:clear-history',
    },
    // Filesystem (new typed IPC)
    FILESYSTEM: {
        READ_TEXT: 'filesystem:read-text',
        WRITE_TEXT: 'filesystem:write-text',
        CREATE_DIR: 'filesystem:create-dir',
    },
    // Intent (new typed IPC)
    INTENT: {
        PROCESS: 'intent:process',
        EXECUTE_ACTION: 'intent:execute-action',
    },
    // App (new typed IPC)
    APP_NEW: {
        GET_VERSION: 'app:get-version',
        OPEN_EXTERNAL: 'app:open-external',
        GET_CONFIG: 'app:get-config',
        SET_CONFIG: 'app:set-config',
    },
    // Agent (new typed IPC)
    AGENT_NEW: {
        SEND: 'agent:send',
        REQUEST_STATUS: 'agent:request-status',
    },
    // License (new typed IPC)
    LICENSE_NEW: {
        VERIFY: 'license:verify-new',
        GET: 'license:get-new',
        REFRESH: 'license:refresh-new',
    },
    // Terminal (new typed IPC)
    TERMINAL_NEW: {
        CREATE: 'terminal:create-new',
        WRITE: 'terminal:write-new',
        KILL: 'terminal:kill-new',
    },
};
// Helper to get all allowed channels
export const ALLOWED_IPC_CHANNELS = new Set(Object.values(IPC_CHANNELS).flatMap((group) => typeof group === 'object' ? Object.values(group) : [group]));
