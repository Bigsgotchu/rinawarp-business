import { IPC_CHANNELS, APP_CONFIG } from '../../shared/constants';
export class AppHandler {
    initialized = false;
    constructor() {
        console.log('📱 Initializing App Handler');
    }
    register(ipcMain) {
        if (this.initialized)
            return;
        ipcMain.handle(IPC_CHANNELS.APP.GET_VERSION, this.handleGetVersion.bind(this));
        ipcMain.handle(IPC_CHANNELS.APP.OPEN_EXTERNAL, this.handleOpenExternal.bind(this));
        ipcMain.handle(IPC_CHANNELS.APP.GET_CONFIG, this.handleGetConfig.bind(this));
        ipcMain.handle(IPC_CHANNELS.APP.SET_CONFIG, this.handleSetConfig.bind(this));
        this.initialized = true;
        console.log('✅ App IPC handlers registered');
    }
    async handleGetVersion(event, payload) {
        console.log('📋 Get version:', payload);
        return { version: APP_CONFIG.version, name: APP_CONFIG.name };
    }
    async handleOpenExternal(event, payload) {
        console.log('🔗 Open external:', payload);
        return { success: true };
    }
    async handleGetConfig(event, payload) {
        console.log('⚙️ Get config:', payload);
        return { config: {} };
    }
    async handleSetConfig(event, payload) {
        console.log('💾 Set config:', payload);
        return { success: true };
    }
    cleanup() {
        this.initialized = false;
    }
}
