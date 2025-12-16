// Central registry of channel names (prevents typos)
export const IPC_CHANNELS = {
  APP_VERSION: 'app:version',
  OPEN_EXTERNAL: 'shell:open-external',
  RUN_TASK: 'task:run',
  PTY_SPAWN: 'pty:spawn',
  PTY_INPUT: 'pty:input',
  PTY_RESIZE: 'pty:resize',
  PTY_KILL: 'pty:kill',
  PTY_ON_DATA: 'pty:onData',
  PTY_ON_EXIT: 'pty:onExit',
} as const;

// Clean Channels object as requested in the plan
export const Channels = {
  PTY: {
    SPAWN: 'pty:spawn' as const,
    WRITE: 'pty:input' as const, // Alias for input
    RESIZE: 'pty:resize' as const,
    KILL: 'pty:kill' as const,
    DATA: 'pty:onData' as const,
    EXIT: 'pty:onExit' as const,
  },
  APP: {
    VERSION: 'app:version' as const,
  },
  SHELL: {
    OPEN_EXTERNAL: 'shell:open-external' as const,
  },
  TASK: {
    RUN: 'task:run' as const,
  },
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
