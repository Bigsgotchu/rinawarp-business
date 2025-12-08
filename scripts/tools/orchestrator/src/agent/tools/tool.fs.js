import fs from 'node:fs';
import path from 'node:path';
export function fsTool(kind) {
  return async function (args) {
    if (kind === 'read') return fs.readFileSync(args.path, 'utf-8');
    if (kind === 'write') {
      fs.writeFileSync(args.path, args.content, 'utf-8');
      return { ok: true };
    }
    if (kind === 'list')
      return fs
        .readdirSync(args.path)
        .map((p) => ({ name: p, isDir: fs.statSync(path.join(args.path, p)).isDirectory() }));
    throw new Error('Unknown fs tool op');
  };
}
