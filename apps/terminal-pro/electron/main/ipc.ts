import { ipcMain } from 'electron';
import pty from 'node-pty';
import { Channels } from '../../../../packages/shared/src/ipc/channels';
import {
  PtySpawnReq,
  PtyWriteReq,
  PtyResizeReq,
  PtyKillReq,
} from '../../../../packages/shared/src/ipc/schemas';

type Session = { pty: pty.IPty; shell: string };
const SESSIONS = new Map<string, Session>();

ipcMain.handle(Channels.PTY.SPAWN, (_e, payload) => {
  const req = PtySpawnReq.parse(payload);
  const shell =
    req.shell ?? (process.platform === 'win32' ? 'powershell.exe' : process.env.SHELL || 'bash');

  // Security: whitelist environment variables
  const allowed = ['TERM', 'LANG', 'PATH'];
  const filteredEnv = Object.fromEntries(
    Object.entries({ ...(req.env ?? {}) }).filter(([k]) => allowed.includes(k)),
  );

  const child = pty.spawn(shell, req.args ?? [], {
    name: 'xterm-color',
    cols: req.cols ?? 80,
    rows: req.rows ?? 24,
    cwd: req.cwd ?? process.cwd(),
    env: { ...process.env, ...filteredEnv },
  });
  SESSIONS.set(req.id, { pty: child, shell });

  child.onData((data) => {
    _e.sender.send(Channels.PTY.DATA, { id: req.id, data });
  });

  child.onExit((ev) => {
    SESSIONS.delete(req.id);
    _e.sender.send(Channels.PTY.EXIT, { id: req.id, code: ev.exitCode, signal: ev.signal });
  });

  return { ok: true as const };
});

ipcMain.handle(Channels.PTY.WRITE, (_e, payload) => {
  const { id, data } = PtyWriteReq.parse(payload);
  const s = SESSIONS.get(id);
  if (!s) return { ok: false as const, error: 'no-session' };
  s.pty.write(data);
  return { ok: true as const };
});

ipcMain.handle(Channels.PTY.RESIZE, (_e, payload) => {
  const { id, cols, rows } = PtyResizeReq.parse(payload);
  const s = SESSIONS.get(id);
  if (!s) return { ok: false as const, error: 'no-session' };
  s.pty.resize(cols, rows);
  return { ok: true as const };
});

ipcMain.handle(Channels.PTY.KILL, (_e, payload) => {
  const { id } = PtyKillReq.parse(payload);
  const s = SESSIONS.get(id);
  if (!s) return { ok: true as const }; // idempotent
  try {
    s.pty.kill();
  } finally {
    SESSIONS.delete(id);
  }
  return { ok: true as const };
});
