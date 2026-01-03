import { IPC_CHANNELS } from '../../shared/constants';
import { assertAllowed } from '../policy/runtimePolicy';
import fs from 'node:fs/promises';
import path from 'node:path';
export class FilesystemHandler {
    initialized = false;
    policy;
    constructor(policy) {
        this.policy = policy;
        console.log('📁 Initializing Policy-Guarded Filesystem Handler');
    }
    register(ipcMain) {
        if (this.initialized)
            return;
        // Keep your existing IPC channels
        ipcMain.handle(IPC_CHANNELS.FILESYSTEM.READ_TEXT, this.handleReadText.bind(this));
        ipcMain.handle(IPC_CHANNELS.FILESYSTEM.WRITE_TEXT, this.handleWriteText.bind(this));
        ipcMain.handle(IPC_CHANNELS.FILESYSTEM.CREATE_DIR, this.handleCreateDir.bind(this));
        // Add delete operation
        ipcMain.handle('filesystem:delete', this.handleDelete.bind(this));
        this.initialized = true;
        console.log('✅ Policy-Guarded Filesystem IPC handlers registered');
    }
    async handleReadText(event, payload) {
        console.log('📖 Read text file:', payload);
        try {
            // Policy check for read
            assertAllowed(this.policy.decide({ kind: 'fs:read', path: payload.path }));
            const content = await fs.readFile(payload.path, 'utf-8');
            return { content, success: true };
        }
        catch (e) {
            return { ok: false, error: e instanceof Error ? e.message : String(e) };
        }
    }
    async handleWriteText(event, payload) {
        console.log('✏️ Write text file:', payload);
        try {
            // Policy check for write
            assertAllowed(this.policy.decide({ kind: 'fs:write', path: payload.path }));
            // Ensure directory exists
            const dir = path.dirname(payload.path);
            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(payload.path, payload.content, 'utf-8');
            return { success: true };
        }
        catch (e) {
            return { ok: false, error: e instanceof Error ? e.message : String(e) };
        }
    }
    async handleCreateDir(event, payload) {
        console.log('📁 Create directory:', payload);
        try {
            // Policy check for write (directory creation is a write operation)
            assertAllowed(this.policy.decide({ kind: 'fs:write', path: payload.path }));
            await fs.mkdir(payload.path, { recursive: true });
            return { success: true };
        }
        catch (e) {
            return { ok: false, error: e instanceof Error ? e.message : String(e) };
        }
    }
    async handleDelete(event, payload) {
        console.log('🗑️ Delete filesystem item:', payload);
        try {
            // Policy check for delete
            assertAllowed(this.policy.decide({ kind: 'fs:delete', path: payload.path }));
            await fs.rm(payload.path, { recursive: true, force: true });
            return { success: true };
        }
        catch (e) {
            return { ok: false, error: e instanceof Error ? e.message : String(e) };
        }
    }
    cleanup() {
        this.initialized = false;
    }
}
