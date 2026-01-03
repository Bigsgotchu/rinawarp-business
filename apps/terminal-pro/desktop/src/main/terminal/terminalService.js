// ============================================================================
// File: src/main/terminal/terminalService.ts
// ============================================================================
import pty from 'node-pty';
import crypto from 'node:crypto';
import { EventEmitter } from 'node:events';
export class TerminalService extends EventEmitter {
    sessions = new Map();
    createSession(input) {
        const id = crypto.randomUUID();
        const ptyProcess = pty.spawn(input.shell, [], {
            name: 'xterm-color',
            cols: input.cols ?? 100,
            rows: input.rows ?? 30,
            cwd: input.cwd,
            env: { ...process.env, ...(input.env ?? {}) },
        });
        const session = { id, ptyProcess, createdAt: Date.now() };
        this.sessions.set(id, session);
        // Auto-attach event listeners for streaming
        ptyProcess.onData((data) => {
            this.emit('data', { sessionId: id, data });
        });
        ptyProcess.onExit(({ exitCode, signal }) => {
            this.emit('exit', { sessionId: id, exitCode, signal });
        });
        return session;
    }
    write(sessionId, data) {
        const s = this.sessions.get(sessionId);
        if (!s)
            throw new Error('Unknown session');
        s.ptyProcess.write(data);
    }
    resize(sessionId, cols, rows) {
        const s = this.sessions.get(sessionId);
        if (!s)
            throw new Error('Unknown session');
        s.ptyProcess.resize(cols, rows);
    }
    kill(sessionId) {
        const s = this.sessions.get(sessionId);
        if (!s)
            return;
        try {
            s.ptyProcess.kill();
        }
        finally {
            this.sessions.delete(sessionId);
        }
    }
    get(sessionId) {
        return this.sessions.get(sessionId);
    }
    onData(sessionId, callback) {
        const s = this.sessions.get(sessionId);
        if (!s)
            throw new Error('Unknown session');
        s.ptyProcess.onData(callback);
    }
    onExit(sessionId, callback) {
        const s = this.sessions.get(sessionId);
        if (!s)
            throw new Error('Unknown session');
        s.ptyProcess.onExit(callback);
    }
}
