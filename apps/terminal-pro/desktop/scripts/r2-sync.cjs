const { readdirSync, statSync } = require('node:fs');
const { join, resolve } = require('node:path');
const { execFileSync } = require('node:child_process');

const root = resolve(__dirname, '..');
const dist = resolve(root, 'dist');
const pkg = require(join(root, 'package.json'));
const version = pkg.version;

const prefix = `releases/${version}`;

function put(file) {
  const key = `${prefix}/${file}`;
  const full = join(dist, file);
  if (!statSync(full).isFile()) return;
  console.log('upload:', key);
  execFileSync(
    'npx',
    ['-y', 'wrangler', 'r2', 'object', 'put', 'rinawarp-updates/' + key, '--file', full],
    {
      stdio: 'inherit',
      cwd: root,
    },
  );
}

(function run() {
  const files = readdirSync(dist);
  const wanted = files.filter((f) =>
    /\.(exe|blockmap|zip|dmg|AppImage|7z|tar\.gz|yml|yaml|spdx\.json|sha256sums|SHA256SUMS)$/i.test(
      f,
    ),
  );

  if (wanted.length === 0) {
    console.log('No artifacts found in dist/');
    process.exit(0);
  }

  wanted.forEach(put);
})();
