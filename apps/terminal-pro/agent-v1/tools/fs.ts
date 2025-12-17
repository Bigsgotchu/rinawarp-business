import type { ToolSpec } from '../core/types';
import fs from 'node:fs/promises';
import path from 'node:path';

function withinProject(p: string, root: string) {
  const resolved = path.resolve(root, p);
  return resolved.startsWith(path.resolve(root));
}

export const fsTools: ToolSpec<any, any>[] = [
  {
    name: 'fs.list',
    category: 'read',
    requiresConfirmation: false,
    async run(input: { path: string }, ctx) {
      try {
        if (!withinProject(input.path, ctx.projectRoot)) {
          return {
            success: false,
            error: { code: 'EACCES', message: 'Path outside project root.' },
          };
        }
        const entries = await fs.readdir(path.resolve(ctx.projectRoot, input.path), {
          withFileTypes: true,
        });
        return {
          success: true,
          output: entries.map((e) => ({ name: e.name, type: e.isDirectory() ? 'dir' : 'file' })),
        };
      } catch (e: any) {
        return { success: false, error: { code: 'FS_LIST', message: e.message } };
      }
    },
  },
  {
    name: 'fs.read',
    category: 'read',
    requiresConfirmation: false,
    async run(input: { path: string }, ctx) {
      try {
        if (!withinProject(input.path, ctx.projectRoot)) {
          return {
            success: false,
            error: { code: 'EACCES', message: 'Path outside project root.' },
          };
        }
        const data = await fs.readFile(path.resolve(ctx.projectRoot, input.path), 'utf8');
        return { success: true, output: data };
      } catch (e: any) {
        return { success: false, error: { code: 'FS_READ', message: e.message } };
      }
    },
  },
  {
    name: 'fs.edit',
    category: 'safe-write',
    requiresConfirmation: false,
    async run(input: { path: string; content: string }, ctx) {
      try {
        if (!withinProject(input.path, ctx.projectRoot)) {
          return {
            success: false,
            error: { code: 'EACCES', message: 'Path outside project root.' },
          };
        }
        const full = path.resolve(ctx.projectRoot, input.path);
        const before = await fs.readFile(full, 'utf8').catch(() => '');
        await fs.writeFile(full, input.content, 'utf8');
        const after = await fs.readFile(full, 'utf8');
        // v1: return before/after (you can swap in a real diff later)
        return { success: true, output: { path: input.path, before, after } };
      } catch (e: any) {
        return { success: false, error: { code: 'FS_EDIT', message: e.message } };
      }
    },
  },
  {
    name: 'fs.delete',
    category: 'high-impact',
    requiresConfirmation: true,
    requiredLicense: 'pro',
    async run(input: { path: string }, ctx) {
      try {
        if (!withinProject(input.path, ctx.projectRoot)) {
          return {
            success: false,
            error: { code: 'EACCES', message: 'Path outside project root.' },
          };
        }
        await fs.rm(path.resolve(ctx.projectRoot, input.path), { recursive: true, force: true });
        return { success: true, output: { deleted: input.path } };
      } catch (e: any) {
        return { success: false, error: { code: 'FS_DELETE', message: e.message } };
      }
    },
  },
];
