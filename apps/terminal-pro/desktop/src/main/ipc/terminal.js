import { IPC_CHANNELS } from '../../shared/constants';
import { assertAllowed } from '../policy/runtimePolicy';
export class TerminalHandler {
    initialized = false;
    policy;
    approvals;
    terminals;
    constructor(policy, approvals, terminals) {
        this.policy = policy;
        this.approvals = approvals;
        this.terminals = terminals;
        console.log('💻 Initializing Policy-Guarded Terminal Handler');
    }
    register(ipcMain) {
        if (this.initialized)
            return;
        // Keep your existing IPC channels
        ipcMain.handle(IPC_CHANNELS.TERMINAL.CREATE, this.handleCreate.bind(this));
        ipcMain.handle(IPC_CHANNELS.TERMINAL.WRITE, this.handleWrite.bind(this));
        ipcMain.handle(IPC_CHANNELS.TERMINAL.KILL, this.handleKill.bind(this));
        // Add approval-gated execution
        ipcMain.handle(IPC_CHANNELS.TERMINAL.PROPOSE_EXEC, this.handleProposeExec.bind(this));
        ipcMain.handle(IPC_CHANNELS.TERMINAL.APPROVE_EXEC, this.handleApproveExec.bind(this));
        // Add terminal output streaming
        ipcMain.handle(IPC_CHANNELS.TERMINAL.DATA, this.handleTerminalData.bind(this));
        ipcMain.handle(IPC_CHANNELS.TERMINAL.EXIT_EVENT, this.handleTerminalExit.bind(this));
        this.initialized = true;
        this.setupTerminalEventForwarding();
        console.log('✅ Policy-Guarded Terminal IPC handlers registered');
    }
    async handleCreate(event, payload) {
        console.log('💻 Create terminal with policy:', payload);
        try {
            const session = this.terminals.createSession({
                shell: payload.shell || 'bash',
                cwd: payload.cwd,
                env: payload.env,
            });
            return { terminalId: session.id, ok: true };
        }
        catch (e) {
            return { ok: false, error: e instanceof Error ? e.message : String(e) };
        }
    }
    async handleWrite(event, payload) {
        console.log('📝 Write to terminal:', payload);
        try {
            this.terminals.write(payload.terminalId, payload.data);
            return { success: true };
        }
        catch (e) {
            return { ok: false, error: e instanceof Error ? e.message : String(e) };
        }
    }
    async handleKill(event, payload) {
        console.log('🗑️ Kill terminal:', payload);
        try {
            this.terminals.kill(payload.terminalId);
            return { success: true };
        }
        catch (e) {
            return { ok: false, error: e instanceof Error ? e.message : String(e) };
        }
    }
    // NEW: Policy-guarded command execution
    async handleProposeExec(event, payload) {
        this.approvals.prune();
        try {
            // Policy check
            assertAllowed(this.policy.decide({ kind: 'terminal:exec', command: payload.command }));
            const entry = this.approvals.create({ command: payload.command, cwd: payload.cwd, env: payload.env }, 60_000);
            return { ok: true, token: entry.token, expiresAt: entry.expiresAt };
        }
        catch (e) {
            return { ok: false, error: e instanceof Error ? e.message : String(e) };
        }
    }
    async handleApproveExec(event, payload) {
        try {
            const approved = this.approvals.consume(payload.token);
            // Re-check policy at execution time
            assertAllowed(this.policy.decide({ kind: 'terminal:exec', command: approved.command }));
            const session = this.terminals.get(payload.terminalId);
            if (!session)
                throw new Error('Unknown terminal session');
            session.ptyProcess.write(`${approved.command}\r`);
            return { ok: true };
        }
        catch (e) {
            return { ok: false, error: e instanceof Error ? e.message : String(e) };
        }
    }
    async handleTerminalData(event, payload) {
        // Stream terminal data to renderer
        event.sender.send(IPC_CHANNELS.TERMINAL.DATA, payload);
        return { ok: true };
    }
    async handleTerminalExit(event, payload) {
        // Stream terminal exit to renderer
        event.sender.send(IPC_CHANNELS.TERMINAL.EXIT_EVENT, payload);
        return { ok: true };
    }
    setupTerminalEventForwarding() {
        // Forward terminal events from TerminalService to IPC
        this.terminals.on('data', (payload) => {
            // Broadcast to all webContents
            const { webContents } = require('electron');
            for (const wc of webContents.getAllWebContents()) {
                wc.send(IPC_CHANNELS.TERMINAL.DATA, payload);
            }
        });
        this.terminals.on('exit', (payload) => {
            const { webContents } = require('electron');
            for (const wc of webContents.getAllWebContents()) {
                wc.send(IPC_CHANNELS.TERMINAL.EXIT_EVENT, payload);
            }
        });
    }
    cleanup() {
        this.initialized = false;
    }
}
