import type { ToolSpec } from '../core/types';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const pexec = promisify(exec);

export const processTools: ToolSpec<any, any>[] = [
  {
    name: 'process.list',
    category: 'read',
    requiresConfirmation: false,
    async run(input: { cwd?: string }, ctx) {
      try {
        // Try ps command for process listing
        let cmd = 'ps aux';
        if (process.platform === 'win32') {
          cmd = 'tasklist';
        }

        const { stdout } = await pexec(cmd, {
          cwd: input.cwd ?? ctx.projectRoot,
          env: { ...process.env, ...ctx.env },
        });
        return { success: true, output: stdout };
      } catch (e: any) {
        return { success: false, error: { code: 'PROCESS_LIST', message: e.message } };
      }
    },
  },
  {
    name: 'process.kill',
    category: 'high-impact',
    requiresConfirmation: true,
    requiredLicense: 'pro',
    async run(input: { pid: number }, ctx) {
      try {
        const { stdout } = await pexec(`kill ${input.pid}`, {
          cwd: ctx.projectRoot,
          env: { ...process.env, ...ctx.env },
        });
        return { success: true, output: stdout };
      } catch (e: any) {
        return { success: false, error: { code: 'PROCESS_KILL', message: e.message } };
      }
    },
  },
];
