import type { ToolSpec } from '../core/types';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const pexec = promisify(exec);

export const shellTools: ToolSpec<any, any>[] = [
  {
    name: 'build.run',
    category: 'safe-write',
    requiresConfirmation: false,
    async run(input: { cmd: string; cwd?: string }, ctx) {
      try {
        const { stdout, stderr } = await pexec(input.cmd, {
          cwd: input.cwd ?? ctx.projectRoot,
          env: { ...process.env, ...ctx.env },
          maxBuffer: 10 * 1024 * 1024,
        });
        return { success: true, output: { stdout, stderr } };
      } catch (e: any) {
        return {
          success: false,
          error: { code: 'CMD_EXIT', message: e.message, detail: e.stderr },
        };
      }
    },
  },
  {
    name: 'deploy.prod',
    category: 'high-impact',
    requiresConfirmation: true,
    requiredLicense: 'pro',
    async run(input: { cmd: string; cwd?: string }, ctx) {
      try {
        const { stdout, stderr } = await pexec(input.cmd, {
          cwd: input.cwd ?? ctx.projectRoot,
          env: { ...process.env, ...ctx.env },
          maxBuffer: 10 * 1024 * 1024,
        });
        return { success: true, output: { stdout, stderr } };
      } catch (e: any) {
        return {
          success: false,
          error: { code: 'CMD_EXIT', message: e.message, detail: e.stderr },
        };
      }
    },
  },
];
