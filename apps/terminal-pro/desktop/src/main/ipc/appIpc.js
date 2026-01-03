import { ipcMain, app } from 'electron';
export function registerAppIpc() {
    ipcMain.handle('app:ping', async () => {
        return { ok: true, version: app.getVersion() };
    });
}
