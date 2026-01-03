#!/usr/bin/env node
// Kilo Adaptive Brain - Pre Exec Hook
// Tracks commands & errors in kilo-memory.json

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
    console.error('[kilo-pre-exec] Failed to read JSON:', p, e.message);
    return fallback;
  }
}

function safeWriteJSON(p, data) {
  try {
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('[kilo-pre-exec] Failed to write JSON:', p, e.message);
  }
}

function main() {
  const args = process.argv.slice(2);
  const cmdIndex = args.indexOf('--cmd');
  const errIndex = args.indexOf('--error');

  const command = cmdIndex !== -1 ? args.slice(cmdIndex + 1).join(' ') : null;
  const errorMsg = errIndex !== -1 ? args.slice(errIndex + 1).join(' ') : null;

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

  memory.recentCommands = memory.recentCommands || [];
  memory.recentErrors = memory.recentErrors || [];

  if (command) {
    memory.recentCommands.unshift({
      command,
      at: new Date().toISOString(),
      cwd: ROOT
    });
    // Keep last 25
    memory.recentCommands = memory.recentCommands.slice(0, 25);
  }

  if (errorMsg) {
    memory.recentErrors.unshift({
      error: errorMsg,
      at: new Date().toISOString(),
      command: command || null
    });
    memory.recentErrors = memory.recentErrors.slice(0, 25);
  }

  safeWriteJSON(MEMORY_PATH, memory);

  // Print a short summary that Kilo can surface
  console.log('=== Kilo Adaptive Brain ===');
  if (command) {
    console.log('Last command:', command);
  }
  if (memory.paths) {
    console.log('Backend:', memory.paths.backend || 'unknown');
    console.log('Desktop:', memory.paths.desktop || 'unknown');
    console.log('Website:', memory.paths.website || 'unknown');
  }
  if (memory.buildCommands) {
    console.log('Known builds:', Object.keys(memory.buildCommands).join(', ') || 'none');
  }
  console.log('Last scan:', memory.lastScan || 'never');
}

main();