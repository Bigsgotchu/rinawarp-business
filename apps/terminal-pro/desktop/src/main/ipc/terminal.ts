// ============================================================================
// File: src/main/ipc/terminal.ts
// Policy-guarded terminal IPC + approval-gated exec + event streaming
// ============================================================================

import type { IpcMain, IpcMainInvokeEvent } from 'electron';
import { webContents } from 'electron';
import { IPC } from '../../shared/constants';
import { RuntimePolicy, assertAllowed } from '../policy/runtimePolicy';
import { ApprovalStore } from '../security/approvalStore';
import { TerminalService } from '../terminal/terminalService';

type CreateTerminalPayload = {
  shell?: string;
  cwd?: string;
  env?: Record<string, string>;
};

type WriteTerminalPayload = {
  terminalId: string;
  data: string;
};

type KillTerminalPayload = {
  terminalId: string;
};

type ProposeExecPayload = {
  command: string;
  cwd?: string;
  env?: Record<string, string>;
};

type ApproveExecPayload = {
  terminalId: string;
  token: string;
};

type Ok<T> = { ok: true } & T;
type Err = { ok: false; error: string };

export class TerminalHandler {
  private initialized = false;

  constructor(
    private readonly policy: RuntimePolicy,
    private readonly approvals: ApprovalStore,
    private readonly terminals: TerminalService,
  ) {
    console.log('💻 Initializing Policy-Guarded Terminal Handler');
  }

  register(ipcMain: IpcMain): void {
    if (this.initialized) return;

    ipcMain.handle(IPC.terminal.CREATE, this.handleCreate);
    ipcMain.handle(IPC.terminal.WRITE, this.handleWrite);
    ipcMain.handle(IPC.terminal.KILL, this.handleKill);

    ipcMain.handle(IPC.terminal.PROPOSE_EXEC, this.handleProposeExec);
    ipcMain.handle(IPC.terminal.APPROVE_EXEC, this.handleApproveExec);

    this.initialized = true;
    this.setupTerminalEventForwarding();

    console.log('✅ Terminal IPC handlers registered');
  }

  cleanup(): void {
    this.initialized = false;
  }

  private handleCreate = async (
    _event: IpcMainInvokeEvent,
    payload: CreateTerminalPayload,
  ): Promise<Ok<{ terminalId: string }> | Err> => {
    try {
      const session = this.terminals.createSession({
        shell: payload.shell ?? 'bash',
        ...(payload.cwd ? { cwd: payload.cwd } : {}),
        ...(payload.env ? { env: payload.env } : {}),
      });

      return { ok: true, terminalId: session.id };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  };

  private handleWrite = async (
    _event: IpcMainInvokeEvent,
    payload: WriteTerminalPayload,
  ): Promise<Ok<{ success: true }> | Err> => {
    try {
      this.terminals.write(payload.terminalId, payload.data);
      return { ok: true, success: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  };

  private handleKill = async (
    _event: IpcMainInvokeEvent,
    payload: KillTerminalPayload,
  ): Promise<Ok<{ success: true }> | Err> => {
    try {
      this.terminals.kill(payload.terminalId);
      return { ok: true, success: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  };

  private handleProposeExec = async (
    _event: IpcMainInvokeEvent,
    payload: ProposeExecPayload,
  ): Promise<Ok<{ token: string; expiresAt: number }> | Err> => {
    this.approvals.prune();

    try {
      assertAllowed(this.policy.decide({ kind: 'terminal:exec', command: payload.command }));

      const entry = this.approvals.create(
        { command: payload.command, ...(payload.cwd ? { cwd: payload.cwd } : {}), ...(payload.env ? { env: payload.env } : {}) },
        60_000,
      );

      return { ok: true, token: entry.token, expiresAt: entry.expiresAt };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  };

  private handleApproveExec = async (
    _event: IpcMainInvokeEvent,
    payload: ApproveExecPayload,
  ): Promise<Ok<{}> | Err> => {
    try {
      const approved = this.approvals.consume(payload.token);

      // Re-check policy at execution time
      assertAllowed(this.policy.decide({ kind: 'terminal:exec', command: approved.command }));

      const session = this.terminals.get(payload.terminalId);
      if (!session) throw new Error('Unknown terminal session');

      session.ptyProcess.write(`${approved.command}\r`);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  };

  private setupTerminalEventForwarding(): void {
    // TerminalService -> renderer push events.
    // NOTE: These are NOT ipcMain.handle() channels; renderer listens via ipcRenderer.on(...)
    this.terminals.on('data', (payload: unknown) => {
      for (const wc of webContents.getAllWebContents()) {
        wc.send(IPC.terminal.DATA, payload);
      }
    });

    this.terminals.on('exit', (payload: unknown) => {
      for (const wc of webContents.getAllWebContents()) {
        wc.send(IPC.terminal.EXIT_EVENT, payload);
      }
    });
  }
}
