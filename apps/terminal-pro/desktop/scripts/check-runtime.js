#!/usr/bin/env node

// Runtime pin checks script
// Validates that the application is running with the correct versions and environment

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('=== RinaWarp Terminal Pro Runtime Check ===\n');

let passed = 0;
let failed = 0;

function check(description, test) {
  try {
    const result = test();
    if (result) {
      console.log(`✓ ${description}`);
      passed++;
    } else {
      console.log(`✗ ${description}`);
      failed++;
    }
  } catch (error) {
    console.log(`✗ ${description} - Error: ${error.message}`);
    failed++;
  }
}

// 1. Node and Electron versions
check('Node version matches package.json', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const requiredVersion = packageJson.engines.node;
  const currentVersion = process.version;

  // Simple version check (could be enhanced with semver)
  return currentVersion.startsWith(
    'v' + requiredVersion.replace('>=', '').replace('^', '').replace('~', ''),
  );
});

check('Electron version matches package.json', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const requiredVersion = packageJson.engines.electron;

  // In main process, we can check process.versions.electron
  if (process.versions && process.versions.electron) {
    const currentVersion = process.versions.electron;
    return currentVersion.startsWith(requiredVersion.replace('^', '').replace('~', ''));
  }

  // If not in Electron, just check if the version is specified
  return !!requiredVersion;
});

// 2. Environment variables
check('Required environment variables are set', () => {
  const required = ['RINAWARP_API_URL', 'RINA_AGENT_URL'];

  return required.every((env) => process.env[env]);
});

check('OpenAI API key is configured (optional)', () => {
  // This is optional, so we just check if it's set correctly if present
  if (process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY.startsWith('sk-') && process.env.OPENAI_API_KEY.length > 20;
  }
  return true; // Not required
});

check('Stripe keys are configured (optional)', () => {
  // These are optional, so we just check format if present
  if (process.env.STRIPE_SECRET_KEY) {
    return (
      process.env.STRIPE_SECRET_KEY.startsWith('sk_') && process.env.STRIPE_SECRET_KEY.length > 20
    );
  }
  if (process.env.STRIPE_PUBLIC_KEY) {
    return (
      process.env.STRIPE_PUBLIC_KEY.startsWith('pk_') && process.env.STRIPE_PUBLIC_KEY.length > 20
    );
  }
  return true; // Not required
});

// 3. File system permissions
check('Config directory is writable', () => {
  const configPath = path.join(
    process.env.HOME || process.env.USERPROFILE || '',
    '.rinawarp-terminal-pro',
  );

  try {
    fs.mkdirSync(configPath, { recursive: true });
    fs.writeFileSync(path.join(configPath, 'test.tmp'), 'test');
    fs.unlinkSync(path.join(configPath, 'test.tmp'));
    return true;
  } catch {
    return false;
  }
});

check('Logs directory is writable', () => {
  const logsPath = path.join(
    process.env.HOME || process.env.USERPROFILE || '',
    '.rinawarp-terminal-pro',
    'logs',
  );

  try {
    fs.mkdirSync(logsPath, { recursive: true });
    fs.writeFileSync(path.join(logsPath, 'test.log'), 'test');
    fs.unlinkSync(path.join(logsPath, 'test.log'));
    return true;
  } catch {
    return false;
  }
});

// 4. Dependencies
check('node-pty is installed and working', () => {
  try {
    const pty = require('node-pty');
    return typeof pty.spawn === 'function';
  } catch {
    return false;
  }
});

check('WebSocket is available', () => {
  try {
    const WebSocket = require('ws');
    return typeof WebSocket.Server === 'function';
  } catch {
    return false;
  }
});

check('OpenAI client is available (if configured)', () => {
  if (!process.env.OPENAI_API_KEY) return true; // Not required

  try {
    const OpenAI = require('openai');
    return typeof OpenAI === 'function';
  } catch {
    return false;
  }
});

// 5. Security
check('No dangerous environment variables', () => {
  const dangerous = ['NODE_OPTIONS', 'ELECTRON_ENABLE_LOGGING', 'ELECTRON_ENABLE_STACK_DUMPING'];

  return !dangerous.some((env) => process.env[env]);
});

check('Process is not running as root (on Unix)', () => {
  if (process.platform === 'win32') return true;

  try {
    return process.getuid() !== 0;
  } catch {
    return true; // Can't check, assume OK
  }
});

// 6. Architecture
check('Process architecture is supported', () => {
  const supported = ['x64', 'arm64'];
  return supported.includes(process.arch);
});

check('Platform is supported', () => {
  const supported = ['win32', 'darwin', 'linux'];
  return supported.includes(process.platform);
});

// 7. Build artifacts
check('Build output directory exists', () => {
  const buildDir = path.join(projectRoot, 'build-output');
  return fs.existsSync(buildDir);
});

check('Main process file exists', () => {
  const mainFile = path.join(projectRoot, 'src/main/main.js');
  return fs.existsSync(mainFile);
});

check('Preload file exists', () => {
  const preloadFile = path.join(projectRoot, 'src/preload/ipc.ts');
  return fs.existsSync(preloadFile);
});

console.log(`\n=== Results ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed === 0) {
  console.log('\n✓ All runtime checks passed!');
  process.exit(0);
} else {
  console.log('\n✗ Some runtime checks failed!');
  process.exit(1);
}
