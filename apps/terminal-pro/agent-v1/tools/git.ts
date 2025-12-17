import type { ToolSpec } from '../core/types';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const pexec = promisify(exec);

export const gitTools: ToolSpec<any, any>[] = [
  {
    name: 'git.status',
    category: 'read',
    requiresConfirmation: false,
    async run(input: { cwd?: string }, ctx) {
      try {
        const { stdout } = await pexec('git status --porcelain', {
          cwd: input.cwd ?? ctx.projectRoot,
          env: { ...process.env, ...ctx.env },
        });
        return { success: true, output: stdout };
      } catch (e: any) {
        return { success: false, error: { code: 'GIT_STATUS', message: e.message } };
      }
    },
  },
  {
    name: 'git.diff',
    category: 'read',
    requiresConfirmation: false,
    async run(input: { cwd?: string }, ctx) {
      try {
        const { stdout } = await pexec('git diff', {
          cwd: input.cwd ?? ctx.projectRoot,
          env: { ...process.env, ...ctx.env },
        });
        return { success: true, output: stdout };
      } catch (e: any) {
        return { success: false, error: { code: 'GIT_DIFF', message: e.message } };
      }
    },
  },
  {
    name: 'git.commit',
    category: 'safe-write',
    requiresConfirmation: false,
    requiredLicense: 'pro',
    async run(input: { message: string; cwd?: string }, ctx) {
      try {
        const { stdout } = await pexec(`git commit -m "${input.message}"`, {
          cwd: input.cwd ?? ctx.projectRoot,
          env: { ...process.env, ...ctx.env },
        });
        return { success: true, output: stdout };
      } catch (e: any) {
        return { success: false, error: { code: 'GIT_COMMIT', message: e.message } };
      }
    },
  },
];
