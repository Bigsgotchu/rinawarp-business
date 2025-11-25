#!/usr/bin/env node
// Kilo Adaptive Brain - Auto Scanner
// Scans the RinaWarp repo and updates .kilo/kilo-memory.json

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const KILO_DIR = path.join(ROOT, '.kilo');
const MEMORY_PATH = path.join(KILO_DIR, 'kilo-memory.json');

function safeReadJSON(p, fallback) {
  try {
    if (!fs.existsSync(p)) return fallback;
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('[kilo-autoscan] Failed to read JSON:', p, e.message);
    return fallback;
  }
}

function safeWriteJSON(p, data) {
  try {
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('[kilo-autoscan] Failed to write JSON:', p, e.message);
  }
}

function fileExists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function loadPackageScripts(relDir) {
  const pkgPath = path.join(ROOT, relDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return null;
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.scripts || null;
  } catch (e) {
    console.error(`[kilo-autoscan] Failed to parse package.json in ${relDir}:`, e.message);
    return null;
  }
}

function collectWorkspaceFiles(baseDir, depth = 2) {
  const result = [];

  function walk(current, level) {
    if (level > depth) return;
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      const rel = path.relative(ROOT, full);
      if (entry.isDirectory()) {
        if (['node_modules', '.git', '.kilo', '.venv', 'venv'].includes(entry.name)) continue;
        walk(full, level + 1);
      } else {
        // Only track relevant files
        if (/\.(py|js|ts|html|css|json|toml|yml|md)$/i.test(entry.name)) {
          result.push(rel);
        }
      }
    }
  }

  walk(baseDir, 0);
  return result;
}

function main() {
  const memory = safeReadJSON(MEMORY_PATH, {
    projectName: 'RinaWarp',
    rootPath: ROOT,
    lastScan: null,
    paths: {},
    buildCommands: {},
    deployCommands: {},
    aiProviders: [],
    recentCommands: [],
    recentErrors: [],
    detectedScripts: {},
    workspaceFiles: [],
    preferences: {}
  });

  console.log('[kilo-autoscan] Starting scan for RinaWarp...');

  // Ensure paths
  memory.paths = memory.paths || {};
  const defaultPaths = {
    backend: 'apps/terminal-pro/backend',
    desktop: 'apps/terminal-pro/desktop',
    website: 'rinawarp-website',
    scripts: 'scripts',
    plugins: 'plugins'
  };
  for (const [k, v] of Object.entries(defaultPaths)) {
    if (!memory.paths[k] && fileExists(v)) {
      memory.paths[k] = v;
      console.log(`[kilo-autoscan] Detected ${k} path: ${v}`);
    }
  }

  // Detect Node scripts in backend & desktop
  memory.detectedScripts = memory.detectedScripts || {};
  ['backend', 'desktop'].forEach((key) => {
    const relDir = memory.paths[key];
    if (!relDir) return;
    const scripts = loadPackageScripts(relDir);
    if (scripts) {
      memory.detectedScripts[key] = scripts;
      console.log(`[kilo-autoscan] Loaded scripts for ${key} from ${relDir}/package.json`);
      // Guess build commands if not already defined
      memory.buildCommands = memory.buildCommands || {};
      if (scripts['build:linux'] && !memory.buildCommands.linux) {
        memory.buildCommands.linux = `cd ${relDir} && npm run build:linux`;
      }
      if (scripts['build:win'] && !memory.buildCommands.win) {
        memory.buildCommands.win = `cd ${relDir} && npm run build:win`;
      }
      if (scripts['build:mac'] && !memory.buildCommands.mac) {
        memory.buildCommands.mac = `cd ${relDir} && npm run build:mac`;
      }
    }
  });

  // Collect workspace files for context
  const workspaceRoots = [];
  if (memory.paths.backend && fileExists(memory.paths.backend)) {
    workspaceRoots.push(path.join(ROOT, memory.paths.backend));
  }
  if (memory.paths.desktop && fileExists(memory.paths.desktop)) {
    workspaceRoots.push(path.join(ROOT, memory.paths.desktop));
  }
  if (memory.paths.website && fileExists(memory.paths.website)) {
    workspaceRoots.push(path.join(ROOT, memory.paths.website));
  }

  let allFiles = [];
  for (const root of workspaceRoots) {
    allFiles = allFiles.concat(collectWorkspaceFiles(root, 2));
  }
  memory.workspaceFiles = Array.from(new Set(allFiles)).sort();

  // Update scan time
  memory.lastScan = new Date().toISOString();

  safeWriteJSON(MEMORY_PATH, memory);
  console.log('[kilo-autoscan] Scan complete. Memory updated at', memory.lastScan);
}

main();