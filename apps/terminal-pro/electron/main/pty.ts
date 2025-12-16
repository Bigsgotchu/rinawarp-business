import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { app } from 'electron';
import * as pty from 'node-pty';
import { z } from 'zod';
import { IPC_CHANNELS } from '../../../../packages/shared/src/ipc/channels';
import {
  PtySpawnReq,
  PtyInputReq,
  PtyResizeReq,
  PtyKillReq,
} from '../../../../packages/shared/src/ipc/schemas';

type Session = {
  id: string;
  pid: number;
  pty: pty.IPty;
};

const sessions = new Map<string, Session>();

export function defaultShell(): string {
  if (process.platform === 'win32') {
    return process.env.COMSPEC || 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';
  }
  return process.env.SHELL || '/bin/bash';
}

export function spawnSession(args: z.infer<typeof PtySpawnReq>) {
  const shell = args.shell ?? defaultShell();
  const env = { ...process.env, ...(args.env ?? {}) };

  const child = pty.spawn(shell, args.args ?? [], {
    name: 'xterm-256color',
    cols: args.cols ?? 80,
    rows: args.rows ?? 24,
    cwd: args.cwd ?? os.homedir(),
    env,
  });

  const id = randomUUID();
  const s: Session = { id, pid: child.pid, pty: child };
  sessions.set(id, s);
  return s;
}

export function writeInput({ id, data }: z.infer<typeof PtyInputReq>) {
  const s = sessions.get(id);
  if (s) s.pty.write(data);
}

export function resize({ id, cols, rows }: z.infer<typeof PtyResizeReq>) {
  const s = sessions.get(id);
  if (s) s.pty.resize(cols, rows);
}

export function kill({ id, signal }: z.infer<typeof PtyKillReq>) {
  const s = sessions.get(id);
  if (!s) return;
  try {
    s.pty.kill(signal);
  } finally {
    sessions.delete(id);
  }
}

export function bindPtyEvents(win: Electron.BrowserWindow) {
  // push PTY data to renderer via IPC events
  for (const s of sessions.values()) {
    s.pty.onData((data: string) => {
      win.webContents.send(IPC_CHANNELS.PTY_ON_DATA, { id: s.id, data });
    });
    s.pty.onExit(({ exitCode, signal }: { exitCode: number; signal?: number | null }) => {
      win.webContents.send(IPC_CHANNELS.PTY_ON_EXIT, {
        id: s.id,
        code: exitCode,
        signal: signal ?? null,
      });
      sessions.delete(s.id);
    });
  }
}

export function getSession(id: string) {
  return sessions.get(id);
}
