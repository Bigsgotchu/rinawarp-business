import { ipcMain, app } from 'electron';

export type AppPingResponse = {
  ok: true;
  version: string;
};

export function registerAppIpc(): void {
  ipcMain.handle('app:ping', async (): Promise<AppPingResponse> => {
    return { ok: true, version: app.getVersion() };
  });
}
