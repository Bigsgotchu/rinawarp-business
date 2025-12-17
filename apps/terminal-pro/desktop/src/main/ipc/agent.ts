import { IpcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';

export class AgentHandler {
  private initialized = false;

  constructor() {
    console.log('🤖 Initializing Agent Handler');
  }

  register(ipcMain: IpcMain): void {
    if (this.initialized) return;

    ipcMain.handle(IPC_CHANNELS.AGENT.SEND, this.handleSend.bind(this));
    ipcMain.handle(IPC_CHANNELS.AGENT.REQUEST_STATUS, this.handleRequestStatus.bind(this));

    this.initialized = true;
    console.log('✅ Agent IPC handlers registered');
  }

  private async handleSend(event: any, payload: any): Promise<any> {
    console.log('🤖 Send to agent:', payload);
    return { success: true, response: 'Agent response' };
  }

  private async handleRequestStatus(event: any, payload: any): Promise<any> {
    console.log('📊 Request agent status:', payload);
    return { status: 'connected', healthy: true };
  }

  cleanup(): void {
    this.initialized = false;
  }
}
