// ============================================================================
// File: src/main/ipc/policyIpc.ts
// ============================================================================
import { ipcMain } from 'electron';
export function registerPolicyIpc(policy) {
    ipcMain.handle('policy:get', async () => policy.getMode());
    ipcMain.handle('policy:set', async (_e, partial) => {
        return policy.setMode({
            offline: partial.offline === undefined ? undefined : Boolean(partial.offline),
            safeMode: partial.safeMode === undefined ? undefined : Boolean(partial.safeMode),
        });
    });
}
