// ============================================================================
// File: src/main/ipc/filesystemIpc.ts
// ============================================================================
import { ipcMain } from 'electron';
import { RuntimePolicy, assertAllowed } from '../policy/runtimePolicy';
import fs from 'node:fs/promises';
import path from 'node:path';

export type FilesystemReadTextInput = {
  path: string;
};

export type FilesystemWriteTextInput = {
  path: string;
  content: string;
};

export type FilesystemCreateDirInput = {
  path: string;
};

export function registerFilesystemIpc(opts: { policy: RuntimePolicy }): void {
  const { policy } = opts;

  ipcMain.handle('filesystem:readText', async (_e, input: FilesystemReadTextInput) => {
    // Policy check for filesystem read
    assertAllowed(policy.decide({ kind: 'fs:read', path: input.path }));

    try {
      const content = await fs.readFile(input.path, 'utf-8');
      return { ok: true, content };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  });

  ipcMain.handle('filesystem:writeText', async (_e, input: FilesystemWriteTextInput) => {
    // Policy check for filesystem write
    assertAllowed(policy.decide({ kind: 'fs:write', path: input.path }));

    try {
      // Ensure directory exists
      const dir = path.dirname(input.path);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(input.path, input.content, 'utf-8');
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  });

  ipcMain.handle('filesystem:createDir', async (_e, input: FilesystemCreateDirInput) => {
    // Policy check for directory creation (treat as write operation)
    assertAllowed(policy.decide({ kind: 'fs:write', path: input.path }));

    try {
      await fs.mkdir(input.path, { recursive: true });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  });

  ipcMain.handle('filesystem:delete', async (_e, input: { path: string }) => {
    // Policy check for filesystem delete
    assertAllowed(policy.decide({ kind: 'fs:delete', path: input.path }));

    try {
      await fs.rm(input.path, { recursive: true, force: true });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  });
}
