import { ipcMain } from 'electron';
export function registerRinaIpc(provider) {
    ipcMain.handle('rina:health', async () => provider.getHealth());
    ipcMain.handle('rina:setOfflineMode', async (_e, offline) => {
        await provider.setOfflineMode(Boolean(offline));
        return { ok: true };
    });
    ipcMain.handle('rina:smokeRoundTrip', async (_e, payload) => provider.smokeRoundTrip({
        prompt: String(payload?.prompt ?? ''),
        offline: Boolean(payload?.offline),
    }));
}
