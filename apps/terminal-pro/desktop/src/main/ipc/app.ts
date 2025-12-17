import { IpcMain } from 'electron';
import { IPC_CHANNELS, APP_CONFIG } from '../../shared/constants';

export class AppHandler {
  private initialized = false;

  constructor() {
    console.log('📱 Initializing App Handler');
  }

  register(ipcMain: IpcMain): void {
    if (this.initialized) return;

    ipcMain.handle(IPC_CHANNELS.APP.GET_VERSION, this.handleGetVersion.bind(this));
    ipcMain.handle(IPC_CHANNELS.APP.OPEN_EXTERNAL, this.handleOpenExternal.bind(this));
    ipcMain.handle(IPC_CHANNELS.APP.GET_CONFIG, this.handleGetConfig.bind(this));
    ipcMain.handle(IPC_CHANNELS.APP.SET_CONFIG, this.handleSetConfig.bind(this));

    this.initialized = true;
    console.log('✅ App IPC handlers registered');
  }

  private async handleGetVersion(event: any, payload: any): Promise<any> {
    console.log('📋 Get version:', payload);
    return { version: APP_CONFIG.version, name: APP_CONFIG.name };
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
