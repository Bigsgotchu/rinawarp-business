// Auto-generated TypeScript definitions for RinaWarp Terminal Pro
// This file is generated from src/shared/ipc-map.ts and provides type safety

export interface IPCChannels {
  'config:get': CONFIGGET;
  'config:setLicenseKey': CONFIGSET_LICENSE_KEY;
  'config:clearLicense': CONFIGCLEAR_LICENSE;
  'auth:getToken': AUTHGET_TOKEN;
  'license:getKey': LICENSEGET_KEY;
  'license:verify': LICENSEVERIFY;
  'license:refresh': LICENSEREFRESH;
  'get-license-plan': LICENSEGET_PLAN;
  'agent:ask': AGENTASK;
  'agent:get-status': AGENTGET_STATUS;
  'agent:check-now': AGENTCHECK_NOW;
  'rina:chat': RINACHAT;
  'rina:get-layout': RINAGET_LAYOUT;
  'rina:set-layout': RINASET_LAYOUT;
  'billing:start-upgrade': BILLINGSTART_UPGRADE;
  'update:restart': UPDATERESTART;
  'update:get-channel': UPDATEGET_CHANNEL;
  'update:set-channel': UPDATESET_CHANNEL;
  'get-app-version': APPGET_VERSION;
  'get-release-notes': APPGET_RELEASE_NOTES;
  'sync:save': SYNCSAVE;
  'sync:load': SYNCLOAD;
  'team:create-billing-session': TEAMCREATE_BILLING_SESSION;
  'team:get-seats': TEAMGET_SEATS;
  'team:create-shared-session': TEAMCREATE_SHARED_SESSION;
  'team:join-session': TEAMJOIN_SESSION;
  'team:get-activity': TEAMGET_ACTIVITY;
  'team:store-ai-memory': TEAMSTORE_AI_MEMORY;
  'team:search-memory': TEAMSEARCH_MEMORY;
  'portal:open': PORTALOPEN;
  'terminal:create': TERMINALCREATE;
  'terminal:write': TERMINALWRITE;
  'terminal:resize': TERMINALRESIZE;
  'terminal:kill': TERMINALKILL;
  'voice:start': VOICESTART;
  'websocket:start-server': WEBSOCKETSTART_SERVER;
  'websocket:stop-server': WEBSOCKETSTOP_SERVER;
  'websocket:create-shared-session': WEBSOCKETCREATE_SHARED_SESSION;
  'websocket:join-shared-session': WEBSOCKETJOIN_SHARED_SESSION;
  'websocket:broadcast-terminal-data': WEBSOCKETBROADCAST_TERMINAL_DATA;
  'crash-recovery:get-status': CRASH_RECOVERYGET_STATUS;
  'crash-recovery:clear': CRASH_RECOVERYCLEAR;
  'conversation:send-message': CONVERSATIONSEND_MESSAGE;
  'conversation:get-history': CONVERSATIONGET_HISTORY;
  'conversation:clear-history': CONVERSATIONCLEAR_HISTORY;
  'filesystem:read-text': FILESYSTEMREAD_TEXT;
  'filesystem:write-text': FILESYSTEMWRITE_TEXT;
  'filesystem:create-dir': FILESYSTEMCREATE_DIR;
  'intent:process': INTENTPROCESS;
  'intent:execute-action': INTENTEXECUTE_ACTION;
  'app:get-version': APP_NEWGET_VERSION;
  'app:open-external': APP_NEWOPEN_EXTERNAL;
  'app:get-config': APP_NEWGET_CONFIG;
  'app:set-config': APP_NEWSET_CONFIG;
  'agent:send': AGENT_NEWSEND;
  'agent:request-status': AGENT_NEWREQUEST_STATUS;
  'license:verify-new': LICENSE_NEWVERIFY;
  'license:get-new': LICENSE_NEWGET;
  'license:refresh-new': LICENSE_NEWREFRESH;
  'terminal:create-new': TERMINAL_NEWCREATE;
  'terminal:write-new': TERMINAL_NEWWRITE;
  'terminal:kill-new': TERMINAL_NEWKILL;
}

// Type-safe IPC renderer interface
export interface ElectronAPI {
  CONFIG: {
    GET: () => Promise<any>;
    SET_LICENSE_KEY: () => Promise<any>;
    CLEAR_LICENSE: () => Promise<any>;
  };
  AUTH: {
    GET_TOKEN: () => Promise<any>;
  };
  LICENSE: {
    GET_KEY: () => Promise<any>;
    VERIFY: () => Promise<any>;
    REFRESH: () => Promise<any>;
    GET_PLAN: () => Promise<any>;
  };
  AGENT: {
    ASK: () => Promise<any>;
    GET_STATUS: () => Promise<any>;
    CHECK_NOW: () => Promise<any>;
  };
  RINA: {
    CHAT: () => Promise<any>;
    GET_LAYOUT: () => Promise<any>;
    SET_LAYOUT: () => Promise<any>;
  };
  BILLING: {
    START_UPGRADE: () => Promise<any>;
  };
  UPDATE: {
    RESTART: () => Promise<any>;
    GET_CHANNEL: () => Promise<any>;
    SET_CHANNEL: () => Promise<any>;
  };
  APP: {
    GET_VERSION: () => Promise<any>;
    GET_RELEASE_NOTES: () => Promise<any>;
  };
  SYNC: {
    SAVE: () => Promise<any>;
    LOAD: () => Promise<any>;
  };
  TEAM: {
    CREATE_BILLING_SESSION: () => Promise<any>;
    GET_SEATS: () => Promise<any>;
    CREATE_SHARED_SESSION: () => Promise<any>;
    JOIN_SESSION: () => Promise<any>;
    GET_ACTIVITY: () => Promise<any>;
    STORE_AI_MEMORY: () => Promise<any>;
    SEARCH_MEMORY: () => Promise<any>;
  };
  PORTAL: {
    OPEN: () => Promise<any>;
  };
  TERMINAL: {
    CREATE: () => Promise<any>;
    WRITE: () => Promise<any>;
    RESIZE: () => Promise<any>;
    KILL: () => Promise<any>;
  };
  VOICE: {
    START: () => Promise<any>;
  };
  WEBSOCKET: {
    START_SERVER: () => Promise<any>;
    STOP_SERVER: () => Promise<any>;
    CREATE_SHARED_SESSION: () => Promise<any>;
    JOIN_SHARED_SESSION: () => Promise<any>;
    BROADCAST_TERMINAL_DATA: () => Promise<any>;
  };
  CRASH_RECOVERY: {
    GET_STATUS: () => Promise<any>;
    CLEAR: () => Promise<any>;
  };
  CONVERSATION: {
    SEND_MESSAGE: () => Promise<any>;
    GET_HISTORY: () => Promise<any>;
    CLEAR_HISTORY: () => Promise<any>;
  };
  FILESYSTEM: {
    READ_TEXT: () => Promise<any>;
    WRITE_TEXT: () => Promise<any>;
    CREATE_DIR: () => Promise<any>;
  };
  INTENT: {
    PROCESS: () => Promise<any>;
    EXECUTE_ACTION: () => Promise<any>;
  };
  APP_NEW: {
    GET_VERSION: () => Promise<any>;
    OPEN_EXTERNAL: () => Promise<any>;
    GET_CONFIG: () => Promise<any>;
    SET_CONFIG: () => Promise<any>;
  };
  AGENT_NEW: {
    SEND: () => Promise<any>;
    REQUEST_STATUS: () => Promise<any>;
  };
  LICENSE_NEW: {
    VERIFY: () => Promise<any>;
    GET: () => Promise<any>;
    REFRESH: () => Promise<any>;
  };
  TERMINAL_NEW: {
    CREATE: () => Promise<any>;
    WRITE: () => Promise<any>;
    KILL: () => Promise<any>;
  };
}

// Expose types to global scope
declare global {
  interface Window {
    electronAPI: ElectronAPI;
    ipcChannels: typeof import('./src/shared/ipc-map').IPC_CHANNELS;
  }
}
