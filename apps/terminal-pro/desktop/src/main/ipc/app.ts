import { IpcMain } from 'electron';
import { IPC, APP } from '../../../src/shared/constants';

export class AppHandler {
  private initialized = false;

  constructor() {
    console.log('📱 Initializing App Handler');
  }

  register(ipcMain: IpcMain): void {
    if (this.initialized) return;

    ipcMain.handle(IPC.app.GET_VERSION, this.handleGetVersion.bind(this));
    ipcMain.handle(IPC.app.OPEN_EXTERNAL, this.handleOpenExternal.bind(this));
    ipcMain.handle(IPC.app.GET_CONFIG, this.handleGetConfig.bind(this));
    ipcMain.handle(IPC.app.SET_CONFIG, this.handleSetConfig.bind(this));

    this.initialized = true;
    console.log('✅ App IPC handlers registered');
  }

  private async handleGetVersion(event: any, payload: any): Promise<any> {
    console.log('📋 Get version:', payload);
    return { version: APP.version, name: APP.name };
  }

  private async handleOpenExternal(event: any, payload: any): Promise<any> {
    console.log('🔗 Open external:', payload);
    return { success: true };
  }

  private async handleGetConfig(event: any, payload: any): Promise<any> {
    console.log('⚙️ Get config:', payload);
    return { config: {} };
  }

  private async handleSetConfig(event: any, payload: any): Promise<any> {
    console.log('💾 Set config:', payload);
    return { success: true };
  }

  cleanup(): void {
    this.initialized = false;
  }
}
