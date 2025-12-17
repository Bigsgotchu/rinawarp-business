import { IpcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';

export class IntentHandler {
  private initialized = false;

  constructor() {
    console.log('🎯 Initializing Intent Handler');
  }

  register(ipcMain: IpcMain): void {
    if (this.initialized) return;

    ipcMain.handle(IPC_CHANNELS.INTENT.PROCESS, this.handleProcess.bind(this));
    ipcMain.handle(IPC_CHANNELS.INTENT.EXECUTE_ACTION, this.handleExecuteAction.bind(this));

    this.initialized = true;
    console.log('✅ Intent IPC handlers registered');
  }

  private async handleProcess(event: any, payload: any): Promise<any> {
    console.log('🎯 Process intent:', payload);
    return { success: true, proposals: [] };
  }

  private async handleExecuteAction(event: any, payload: any): Promise<any> {
    console.log('🚀 Execute action:', payload);
    return { success: true };
  }

  cleanup(): void {
    this.initialized = false;
  }
}
