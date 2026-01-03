export const APP = {
    version: '1.0.2',
    name: 'RinaWarp Terminal Pro',
    id: 'com.rinawarp.terminalpro',
    debug: false,
    build: {
        channel: 'stable' as 'stable' | 'canary' | 'nightly',
    },
} as const;

/**
 * Your code expects group-based channel maps, e.g. IPC.agent.SEND.
 * Keep these stable: changing breaks preload + renderer.
 */
export const IPC = {
    agent: {
        SEND: 'agent:send',
        REQUEST_STATUS: 'agent:requestStatus',
    },
    app: {
        GET_VERSION: 'app:getVersion',
        OPEN_EXTERNAL: 'app:openExternal',
        GET_CONFIG: 'app:getConfig',
        SET_CONFIG: 'app:setConfig',
    },
    conversation: {
        SEND_MESSAGE: 'conversation:sendMessage',
        GET_HISTORY: 'conversation:getHistory',
        CLEAR_HISTORY: 'conversation:clearHistory',
    },
    filesystem: {
        READ_TEXT: 'filesystem:readText',
        WRITE_TEXT: 'filesystem:writeText',
        CREATE_DIR: 'filesystem:createDir',
    },
    intent: {
        PROCESS: 'intent:process',
        EXECUTE_ACTION: 'intent:executeAction',
    },
    terminal: {
        CREATE: 'terminal:create',
        WRITE: 'terminal:write',
        KILL: 'terminal:kill',
        PROPOSE_EXEC: 'terminal:proposeExec',
        APPROVE_EXEC: 'terminal:approveExec',
        DATA: 'terminal:data',
        EXIT_EVENT: 'terminal:exit',
    },
    policy: {
        GET: 'policy:get',
        SET: 'policy:set',
    },
    rina: {
        HEALTH: 'rina:health',
        SMOKE_ROUNDTRIP: 'rina:smokeRoundTrip',
    },
} as const satisfies Record<string, Record<string, string>>;

export type IpcGroup = keyof typeof IPC;

/**
 * Backward compatibility: OLD code expects IPC_CHANNELS.<group>.<ACTION>
 * So make IPC_CHANNELS a nested alias of IPC.
 */
export const IPC_CHANNELS = IPC;

/**
 * Optional: if any old JS still expects flat names, keep these too.
 * (Safe to delete once you confirm no references.)
 */
export const IPC_FLAT = {
    POLICY_GET: IPC.policy.GET,
    POLICY_SET: IPC.policy.SET,
    RINA_HEALTH: IPC.rina.HEALTH,
    RINA_SMOKE_ROUNDTRIP: IPC.rina.SMOKE_ROUNDTRIP,
    AGENT_SEND: IPC.agent.SEND,
    AGENT_REQUEST_STATUS: IPC.agent.REQUEST_STATUS,
    APP_GET_VERSION: IPC.app.GET_VERSION,
    APP_OPEN_EXTERNAL: IPC.app.OPEN_EXTERNAL,
    CONVERSATION_SEND_MESSAGE: IPC.conversation.SEND_MESSAGE,
    FILESYSTEM_READ_TEXT: IPC.filesystem.READ_TEXT,
    FILESYSTEM_WRITE_TEXT: IPC.filesystem.WRITE_TEXT,
    INTENT_PROCESS: IPC.intent.PROCESS,
    TERMINAL_CREATE: IPC.terminal.CREATE,
    TERMINAL_WRITE: IPC.terminal.WRITE,
    TERMINAL_KILL: IPC.terminal.KILL,
} as const;

export const APP_CONFIG = {
    version: APP.version,
    name: APP.name,
    id: APP.id,
    debug: process.env.NODE_ENV === 'development',
};

export const SECURITY = {
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
    allowedOrigins: [
        'https://rinawarptech.com',
        'https://api.rinawarptech.com',
        'https://checkout.stripe.com',
        'https://billing.stripe.com',
    ],
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
};