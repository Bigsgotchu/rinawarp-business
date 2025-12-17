import { IpcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';

export class LicenseHandler {
  private initialized = false;

  constructor() {
    console.log('🔑 Initializing License Handler');
  }

  register(ipcMain: IpcMain): void {
    if (this.initialized) return;

    ipcMain.handle(IPC_CHANNELS.LICENSE.VERIFY, this.handleVerify.bind(this));
    ipcMain.handle(IPC_CHANNELS.LICENSE.GET, this.handleGet.bind(this));
    ipcMain.handle(IPC_CHANNELS.LICENSE.REFRESH, this.handleRefresh.bind(this));

    this.initialized = true;
    console.log('✅ License IPC handlers registered');
  }

  private async handleVerify(event: any, payload: any): Promise<any> {
    console.log('🔑 Verify license:', payload);
    return { valid: true, tier: 'pro' };
  }

  private async handleGet(event: any, payload: any): Promise<any> {
    console.log('📋 Get license:', payload);
    return { license: null };
  }

  private async handleRefresh(event: any, payload: any): Promise<any> {
    console.log('🔄 Refresh license:', payload);
    return { success: true };
  }

  cleanup(): void {
    this.initialized = false;
  }
}
