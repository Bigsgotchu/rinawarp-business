// ============================================================================
// File: src/main/ipc/filesystem.ts (UPDATED)
// Integration: Policy-enforced filesystem with your existing IPC channels
// ============================================================================
import { IpcMain } from 'electron';
import { IPC } from '../../../src/shared/constants';
import { RuntimePolicy, assertAllowed } from '../policy/runtimePolicy';
import fs from 'node:fs/promises';
import path from 'node:path';

export class FilesystemHandler {
  private initialized = false;
  private policy: RuntimePolicy;

  constructor(policy: RuntimePolicy) {
    this.policy = policy;
    console.log('📁 Initializing Policy-Guarded Filesystem Handler');
  }

  register(ipcMain: IpcMain): void {
    if (this.initialized) return;

    // Keep your existing IPC channels
    ipcMain.handle(IPC.filesystem.READ_TEXT, this.handleReadText.bind(this));
    ipcMain.handle(IPC.filesystem.WRITE_TEXT, this.handleWriteText.bind(this));
    ipcMain.handle(IPC.filesystem.CREATE_DIR, this.handleCreateDir.bind(this));

    // Add delete operation
    ipcMain.handle('filesystem:delete', this.handleDelete.bind(this));

    this.initialized = true;
    console.log('✅ Policy-Guarded Filesystem IPC handlers registered');
  }

  private async handleReadText(event: any, payload: any): Promise<any> {
    console.log('📖 Read text file:', payload);

    try {
      // Policy check for read
      assertAllowed(this.policy.decide({ kind: 'fs:read', path: payload.path }));

      const content = await fs.readFile(payload.path, 'utf-8');
      return { content, success: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  private async handleWriteText(event: any, payload: any): Promise<any> {
    console.log('✏️ Write text file:', payload);

    try {
      // Policy check for write
      assertAllowed(this.policy.decide({ kind: 'fs:write', path: payload.path }));

      // Ensure directory exists
      const dir = path.dirname(payload.path);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(payload.path, payload.content, 'utf-8');
      return { success: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  private async handleCreateDir(event: any, payload: any): Promise<any> {
    console.log('📁 Create directory:', payload);

    try {
      // Policy check for write (directory creation is a write operation)
      assertAllowed(this.policy.decide({ kind: 'fs:write', path: payload.path }));

      await fs.mkdir(payload.path, { recursive: true });
      return { success: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  private async handleDelete(event: any, payload: any): Promise<any> {
    console.log('🗑️ Delete filesystem item:', payload);

    try {
      // Policy check for delete
      assertAllowed(this.policy.decide({ kind: 'fs:delete', path: payload.path }));

      await fs.rm(payload.path, { recursive: true, force: true });
      return { success: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  cleanup(): void {
    this.initialized = false;
  }
}
