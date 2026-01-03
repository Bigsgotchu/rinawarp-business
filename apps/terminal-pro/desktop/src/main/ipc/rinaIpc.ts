import { ipcMain } from 'electron';

export type RinaHealthResponse =
  | { ok: true; status: 'healthy' | 'degraded'; detail?: string }
  | { ok: false; status: 'down'; detail: string };

export type RinaSmokeResponse =
  | {
      ok: true;
      mode: 'online' | 'offline';
      latencyMs: number;
      text: string;
    }
  | {
      ok: false;
      mode: 'online' | 'offline';
      latencyMs: number;
      error: string;
    };

export type RinaProvider = {
  getHealth: () => Promise<RinaHealthResponse>;
  setOfflineMode: (offline: boolean) => Promise<void>;
  smokeRoundTrip: (input: { prompt: string; offline: boolean }) => Promise<RinaSmokeResponse>;
};

export function registerRinaIpc(provider: RinaProvider): void {
  ipcMain.handle('rina:health', async (): Promise<RinaHealthResponse> => provider.getHealth());

  ipcMain.handle('rina:setOfflineMode', async (_e, offline: boolean): Promise<{ ok: true }> => {
    await provider.setOfflineMode(Boolean(offline));
    return { ok: true };
  });

  ipcMain.handle(
    'rina:smokeRoundTrip',
    async (_e, payload: { prompt: string; offline: boolean }): Promise<RinaSmokeResponse> =>
      provider.smokeRoundTrip({
        prompt: String(payload?.prompt ?? ''),
        offline: Boolean(payload?.offline),
      }),
  );
}
