import { spawn } from 'node:child_process';
export function ffmpegTool(kind) {
  return async function (args) {
    if (kind === 'probe')
      return await exec(
        [
          '-hide_banner',
          '-v',
          'error',
          '-show_format',
          '-show_streams',
          '-print_format',
          'json',
          '-i',
          args.input,
        ],
        { bin: 'ffprobe' },
      );
    if (kind === 'concat') {
      const listFile = args.listFile;
      const out = args.output || 'output.mp4';
      await exec([
        '-hide_banner',
        '-y',
        '-f',
        'concat',
        '-safe',
        '0',
        '-i',
        listFile,
        '-c',
        'copy',
        out,
      ]);
      return { output: out };
    }
    throw new Error('Unknown ffmpeg tool op');
  };
}
function exec(argv, { bin = 'ffmpeg' } = {}) {
  return new Promise((resolve, reject) => {
    const { spawn } = require('node:child_process');
    const p = spawn(bin, argv, { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '',
      err = '';
    p.stdout.on('data', (d) => (out += d.toString()));
    p.stderr.on('data', (d) => (err += d.toString()));
    p.on('close', (c) =>
      c === 0 ? resolve(out || { ok: true }) : reject(new Error(`${bin} failed: ${err}`)),
    );
  });
}
