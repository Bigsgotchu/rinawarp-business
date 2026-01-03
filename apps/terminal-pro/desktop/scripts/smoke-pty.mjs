/**
 * Why: Catches "build succeeded" but node-pty can't load/run on the runner.
 */
import os from 'node:os';
import process from 'node:process';
import pty from 'node-pty';

const shell = process.platform === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/bash';

const p = pty.spawn(
  shell,
  process.platform === 'win32' ? ['-NoLogo'] : ['-lc', 'echo __PTY_OK__'],
  {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.cwd(),
    env: process.env,
  },
);

let out = '';
const timeout = setTimeout(() => {
  console.error('❌ PTY smoke test timed out');
  process.exit(1);
}, 8000);

p.onData((d) => {
  out += d;
  if (out.includes('__PTY_OK__')) {
    clearTimeout(timeout);
    p.kill();
    console.log('✅ PTY smoke test passed');
    process.exit(0);
  }
});

p.onExit(() => {
  clearTimeout(timeout);
  if (!out.includes('__PTY_OK__')) {
    console.error('❌ PTY exited without expected output');
    console.error(out);
    process.exit(1);
  }
});
