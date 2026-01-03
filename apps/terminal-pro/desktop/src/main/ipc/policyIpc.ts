// ============================================================================
// File: src/main/ipc/policyIpc.ts
// ============================================================================
import { ipcMain } from 'electron';
import type { RuntimeMode } from '../policy/runtimePolicy';
import { RuntimePolicy } from '../policy/runtimePolicy';

export function registerPolicyIpc(policy: RuntimePolicy): void {
  ipcMain.handle('policy:get', async (): Promise<RuntimeMode> => policy.getMode());

  ipcMain.handle('policy:set', async (_e, partial: Partial<RuntimeMode>): Promise<RuntimeMode> => {
    return policy.setMode({
      offline: partial.offline === undefined ? undefined : Boolean(partial.offline),
      safeMode: partial.safeMode === undefined ? undefined : Boolean(partial.safeMode),
    });
  });
}
