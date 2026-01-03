// ============================================================================
// File: src/main/terminal/terminalService.ts
// ============================================================================
import pty from 'node-pty';
import crypto from 'node:crypto';
import { EventEmitter } from 'node:events';

export type TerminalSessionId = string;

export type TerminalSession = {
  id: TerminalSessionId;
  ptyProcess: pty.IPty;
  createdAt: number;
};

export type CreateTerminalSessionInput = {
  shell: string;
  cwd?: string;
  env?: Record<string, string>;
  cols?: number;
  rows?: number;
};

export class TerminalService extends EventEmitter {
  private readonly sessions = new Map<TerminalSessionId, TerminalSession>();

  public createSession(input: CreateTerminalSessionInput): TerminalSession {
    const id = crypto.randomUUID();
    const ptyProcess = pty.spawn(input.shell, [], {
      name: 'xterm-color',
      cols: input.cols ?? 100,
      rows: input.rows ?? 30,
      cwd: input.cwd,
      env: { ...process.env, ...(input.env ?? {}) },
    });

    const session: TerminalSession = { id, ptyProcess, createdAt: Date.now() };
    this.sessions.set(id, session);

    // Auto-attach event listeners for streaming
    ptyProcess.onData((data: string) => {
      this.emit('data', { sessionId: id, data });
    });

    ptyProcess.onExit((e: { exitCode: number; signal?: number }) => {
      const signal = e.signal ?? undefined;
      this.emit('exit', { sessionId: id, exitCode: e.exitCode, signal });
    });

    return session;
  }

  public write(sessionId: TerminalSessionId, data: string): void {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error('Unknown session');
    s.ptyProcess.write(data);
  }

  public resize(sessionId: TerminalSessionId, cols: number, rows: number): void {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error('Unknown session');
    s.ptyProcess.resize(cols, rows);
  }

  public kill(sessionId: TerminalSessionId): void {
    const s = this.sessions.get(sessionId);
    if (!s) return;
    try {
      s.ptyProcess.kill();
    } finally {
      this.sessions.delete(sessionId);
    }
  }

  public get(sessionId: TerminalSessionId): TerminalSession | undefined {
    return this.sessions.get(sessionId);
  }

  public onData(sessionId: TerminalSessionId, callback: (data: string) => void): void {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error('Unknown session');
    s.ptyProcess.onData(callback);
  }

  public onExit(
    sessionId: TerminalSessionId,
    callback: (e: { exitCode: number; signal?: number }) => void,
  ): void {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error('Unknown session');
    s.ptyProcess.onExit((e: { exitCode: number; signal?: number }) => {
      callback({ exitCode: e.exitCode, signal: e.signal ?? undefined });
    });
  }
}
