// ============================================================================
// File: src/main/ipc/terminalIpc.ts
// Why: policy guard + approval gating for exec.
// Channels are examples—rename to your existing ones.
// ============================================================================
import { ipcMain, webContents } from 'electron';
import { assertAllowed } from '../policy/runtimePolicy';
export function registerTerminalIpc(opts) {
    const { policy, approvals, terminals } = opts;
    ipcMain.handle('terminal:createSession', async (_e, input) => {
        const s = terminals.createSession({
            shell: input.shell,
            cwd: input.cwd,
            env: input.env,
        });
        return { ok: true, sessionId: s.id };
    });
    ipcMain.handle('terminal:write', async (_e, input) => {
        terminals.write(input.sessionId, String(input.data));
        return { ok: true };
    });
    ipcMain.handle('terminal:resize', async (_e, input) => {
        terminals.resize(input.sessionId, Number(input.cols), Number(input.rows));
        return { ok: true };
    });
    ipcMain.handle('terminal:kill', async (_e, input) => {
        terminals.kill(input.sessionId);
        return { ok: true };
    });
    // Step 1: propose command => returns approval token (no execution).
    ipcMain.handle('terminal:proposeExec', async (_e, input) => {
        approvals.prune();
        // Policy check at proposal time too (so UI can show why it's blocked).
        assertAllowed(policy.decide({ kind: 'terminal:exec', command: input.command }));
        const entry = approvals.create({ command: String(input.command), cwd: input.cwd, env: input.env }, 60_000);
        return { ok: true, token: entry.token, expiresAt: entry.expiresAt };
    });
    // Step 2: approve using token => executes in PTY
    ipcMain.handle('terminal:approveExec', async (_e, input) => {
        const s = terminals.get(input.sessionId);
        if (!s)
            throw new Error('Unknown session');
        const approved = approvals.consume(String(input.token));
        // Must re-check policy at execution time.
        assertAllowed(policy.decide({ kind: 'terminal:exec', command: approved.command }));
        // Optionally change cwd/env by printing commands; actual cwd switching varies per shell.
        // Keep it simple: write the command + newline.
        s.ptyProcess.write(`${approved.command}\r`);
        return { ok: true };
    });
    // Stream PTY output to renderer via event
    // Renderer listens with ipcRenderer.on("terminal:data", ...)
    const attachOutputStreaming = () => {
        // If you have multiple windows, route by event.senderFrame/webContents.id in real code.
        // Here we broadcast to all webContents.
        const broadcast = (channel, payload) => {
            for (const wc of webContents.getAllWebContents())
                wc.send(channel, payload);
        };
        // Hook newly created sessions by monkey-patching createSession if desired.
        // If you already manage sessions elsewhere, attach there.
        const originalCreate = terminals.createSession.bind(terminals);
        terminals.createSession = ((input) => {
            const session = originalCreate(input);
            session.ptyProcess.onData((data) => broadcast('terminal:data', { sessionId: session.id, data }));
            session.ptyProcess.onExit((ev) => broadcast('terminal:exit', { sessionId: session.id, ...ev }));
            return session;
        });
    };
    attachOutputStreaming();
}
