const { readFileSync, writeFileSync, statSync, readdirSync } = require('node:fs');
const { resolve, join } = require('node:path');
const crypto = require('node:crypto');
const YAML = require('yaml');

// ENV in: FEEDS_ORIGIN (Pages) & ARTIFACTS_ORIGIN (R2 Worker)
const FEEDS_ORIGIN = process.env.FEEDS_ORIGIN || 'https://<your-pages>.pages.dev';
const ARTIFACTS_ORIGIN = process.env.ARTIFACTS_ORIGIN || 'https://<your-worker>.workers.dev';

const root = resolve(__dirname, '..');
const dist = resolve(root, 'dist');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const version = pkg.version;

function sha512b64(filePath) {
  const buf = readFileSync(filePath);
  return crypto.createHash('sha512').update(buf).digest('base64');
}

function size(filePath) {
  return statSync(filePath).size;
}

function findOne(patterns) {
  const files = readdirSync(dist);
  for (const p of patterns) {
    const f = files.find((x) => x.includes(p));
    if (f) return f;
  }
  return null;
}

function writeYml(filePath, data) {
  // Feeds must be YAML with specific keys electron-updater expects.
  writeFileSync(filePath, YAML.stringify(data), 'utf8');
  console.log('wrote', filePath);
}

(function run() {
  console.log('Generating feeds using:');
  console.log('  FEEDS_ORIGIN     =', FEEDS_ORIGIN);
  console.log('  ARTIFACTS_ORIGIN =', ARTIFACTS_ORIGIN);

  const releaseBase = `releases/${version}`;

  // ---------- Windows feed (latest.yml) ----------
  const exe = findOne([`-${version}-win-`]) || findOne([`${version}.exe`]);
  const blockmap = findOne([`${version}.exe.blockmap`, '.exe.blockmap']);

  if (exe && blockmap) {
    const exeURL = `${ARTIFACTS_ORIGIN}/${releaseBase}/${exe}`;
    const blockmapURL = `${ARTIFACTS_ORIGIN}/${releaseBase}/${blockmap}`;
    const data = {
      version,
      path: exe,
      sha512: sha512b64(join(dist, exe)),
      releaseDate: new Date().toISOString(),
      files: [
        { url: exeURL, sha512: sha512b64(join(dist, exe)), size: size(join(dist, exe)) },
        {
          url: blockmapURL,
          sha512: sha512b64(join(dist, blockmap)),
          size: size(join(dist, blockmap)),
        },
      ],
    };
    writeYml(join(dist, 'latest.yml'), data);
  } else {
    console.warn('Windows artifacts not found; skipping latest.yml');
  }

  // ---------- macOS feed (latest-mac.yml) ----------
  // Prefer the zip (universal not required; provide x64/arm64 zip(s) – updater supports universal path or one zip)
  const macZip = findOne([`${version}-mac-`, `${version}.zip`, 'mac.zip']);
  if (macZip) {
    const zipURL = `${ARTIFACTS_ORIGIN}/${releaseBase}/${encodeURIComponent(macZip)}`;
    const data = {
      version,
      path: macZip,
      sha512: sha512b64(join(dist, macZip)),
      releaseDate: new Date().toISOString(),
      files: [
        { url: zipURL, sha512: sha512b64(join(dist, macZip)), size: size(join(dist, macZip)) },
      ],
    };
    writeYml(join(dist, 'latest-mac.yml'), data);
  } else {
    console.warn('macOS zip not found; skipping latest-mac.yml');
  }

  // ---------- Linux feed (latest-linux.yml) ----------
  const appImage = findOne([`${version}-linux-`, `${version}.AppImage`, 'AppImage']);
  if (appImage) {
    const liURL = `${ARTIFACTS_ORIGIN}/${releaseBase}/${appImage}`;
    const data = {
      version,
      path: appImage,
      sha512: sha512b64(join(dist, appImage)),
      releaseDate: new Date().toISOString(),
      files: [
        { url: liURL, sha512: sha512b64(join(dist, appImage)), size: size(join(dist, appImage)) },
      ],
    };
    writeYml(join(dist, 'latest-linux.yml'), data);
  } else {
    console.warn('Linux AppImage not found; skipping latest-linux.yml');
  }

  // Stage feeds for Pages "/stable/"
  const { mkdirSync, copyFileSync } = require('node:fs');
  const updates = resolve(dist, 'updates');
  mkdirSync(join(updates, 'stable'), { recursive: true });
  for (const f of ['latest.yml', 'latest-mac.yml', 'latest-linux.yml']) {
    try {
      copyFileSync(join(dist, f), join(updates, 'stable', f));
      console.log('staged for Pages:', f);
    } catch {}
  }
})();
