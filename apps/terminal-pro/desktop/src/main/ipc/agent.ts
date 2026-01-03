// ============================================================================
// File: src/main/ipc/agent.ts
// Minimal agent IPC (typed + compile-safe)
// ============================================================================

import type { IpcMain, IpcMainInvokeEvent } from 'electron';
import { IPC } from '../../../src/shared/constants';

type AgentSendPayload = {
  message: string;
  context?: Record<string, unknown>;
};

type AgentStatusResponse = {
  status: 'connected' | 'disconnected' | 'degraded';
  healthy: boolean;
};

type Ok<T> = { ok: true } & T;
type Err = { ok: false; error: string };

export class AgentHandler {
  private initialized = false;

  constructor() {
    console.log('🤖 Initializing Agent Handler');
  }

  register(ipcMain: IpcMain): void {
    if (this.initialized) return;

    ipcMain.handle(IPC.agent.SEND, this.handleSend);
    ipcMain.handle(IPC.agent.REQUEST_STATUS, this.handleRequestStatus);

    this.initialized = true;
    console.log('✅ Agent IPC handlers registered');
  }

  cleanup(): void {
    this.initialized = false;
  }

  private handleSend = async (
    _event: IpcMainInvokeEvent,
    payload: AgentSendPayload,
  ): Promise<Ok<{ response: string }> | Err> => {
    try {
      console.log('🤖 Send to agent:', payload.message);
      // TODO: wire to real Rina/agent bridge.
      return { ok: true, response: 'Agent response' };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  };

  private handleRequestStatus = async (
    _event: IpcMainInvokeEvent,
    _payload: unknown,
  ): Promise<Ok<AgentStatusResponse> | Err> => {
    try {
      return { ok: true, status: 'connected', healthy: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  };
}
