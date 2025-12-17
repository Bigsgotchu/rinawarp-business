import { IpcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';

export class TerminalHandler {
  private initialized = false;

  constructor() {
    console.log('💻 Initializing Terminal Handler');
  }

  register(ipcMain: IpcMain): void {
    if (this.initialized) return;

    ipcMain.handle(IPC_CHANNELS.TERMINAL.CREATE, this.handleCreate.bind(this));
    ipcMain.handle(IPC_CHANNELS.TERMINAL.WRITE, this.handleWrite.bind(this));
    ipcMain.handle(IPC_CHANNELS.TERMINAL.KILL, this.handleKill.bind(this));

    this.initialized = true;
    console.log('✅ Terminal IPC handlers registered');
  }

  private async handleCreate(event: any, payload: any): Promise<any> {
    console.log('💻 Create terminal:', payload);
    return { terminalId: 'terminal-1' };
  }

  private async handleWrite(event: any, payload: any): Promise<any> {
    console.log('📝 Write to terminal:', payload);
    return { success: true };
  }

  private async handleKill(event: any, payload: any): Promise<any> {
    console.log('🗑️ Kill terminal:', payload);
    return { success: true };
  }

  cleanup(): void {
    this.initialized = false;
  }
}
