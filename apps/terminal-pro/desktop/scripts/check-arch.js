#!/usr/bin/env node

// Architecture verification script
// Checks that the project follows the governed Electron platform architecture

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('=== RinaWarp Terminal Pro Architecture Check ===\n');

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

// 1. IPC Scale & Safety
check('IPC map exists', () => {
  return fs.existsSync(path.join(projectRoot, 'src/shared/ipc-map.ts'));
});

check('IPC guard exists', () => {
  return fs.existsSync(path.join(projectRoot, 'src/main/ipc-guard.ts'));
});

check('Preload IPC exists', () => {
  return fs.existsSync(path.join(projectRoot, 'src/preload/ipc.ts'));
});

check('Type definitions exist', () => {
  return fs.existsSync(path.join(projectRoot, 'rinawarp.d.ts'));
});

check('No direct ipcRenderer in renderer', () => {
  const rendererDir = path.join(projectRoot, 'src/renderer');
  if (!fs.existsSync(rendererDir)) return true;
  
  const files = fs.readdirSync(rendererDir, { recursive: true });
  return !files.some(file => {
    if (!file.endsWith('.js') && !file.endsWith('.ts')) return false;
    const content = fs.readFileSync(path.join(rendererDir, file), 'utf-8');
    return content.includes('ipcRenderer');
  });
});

// 2. Terminal Engine Safety
check('PTY spawn is guarded', () => {
  const mainFile = path.join(projectRoot, 'src/main/main.js');
  if (!fs.existsSync(mainFile)) return false;
  
  const content = fs.readFileSync(mainFile, 'utf-8');
  return content.includes('Guard PTY spawn by platform checks');
});

check('No node-pty in renderer', () => {
  const rendererDir = path.join(projectRoot, 'src/renderer');
  if (!fs.existsSync(rendererDir)) return true;
  
  const files = fs.readdirSync(rendererDir, { recursive: true });
  return !files.some(file => {
    if (!file.endsWith('.js') && !file.endsWith('.ts')) return false;
    const content = fs.readFileSync(path.join(rendererDir, file), 'utf-8');
    return content.includes('node-pty');
  });
});

// 3. AI Integration
check('OpenAI API key not hardcoded', () => {
  const files = [
    path.join(projectRoot, 'src/main/main.js'),
    path.join(projectRoot, 'src/preload/ipc.ts'),
    path.join(projectRoot, 'src/renderer/**/*.js'),
    path.join(projectRoot, 'src/renderer/**/*.ts')
  ];
  
  return !files.some(filePattern => {
    try {
      const glob = require('glob');
      const matches = glob.sync(filePattern, { cwd: projectRoot });
      return matches.some(file => {
        const content = fs.readFileSync(file, 'utf-8');
        return content.includes('sk-') && content.includes('openai');
      });
    } catch {
      return false;
    }
  });
});

check('Cloudflare endpoints are configurable', () => {
  const mainFile = path.join(projectRoot, 'src/main/main.js');
  if (!fs.existsSync(mainFile)) return false;
  
  const content = fs.readFileSync(mainFile, 'utf-8');
  return content.includes('RINA_AGENT_URL') && content.includes('process.env');
});

// 4. Licensing & Billing
check('Billing code isolated from renderer', () => {
  const rendererDir = path.join(projectRoot, 'src/renderer');
  if (!fs.existsSync(rendererDir)) return true;
  
  const files = fs.readdirSync(rendererDir, { recursive: true });
  return !files.some(file => {
    if (!file.endsWith('.js') && !file.endsWith('.ts')) return false;
    const content = fs.readFileSync(path.join(rendererDir, file), 'utf-8');
    return content.includes('stripe') && content.includes('new Stripe');
  });
});

// 5. Collaboration
check('WebSocket server owned by main process', () => {
  const mainFile = path.join(projectRoot, 'src/main/main.js');
  if (!fs.existsSync(mainFile)) return false;
  
  const content = fs.readFileSync(mainFile, 'utf-8');
  return content.includes('WebSocket.Server') && content.includes('setupWebSocketServer');
});

// 6. Crash Recovery
check('Crash telemetry exists', () => {
  return fs.existsSync(path.join(projectRoot, 'src/main/crash-telemetry.js'));
});

check('Safe-mode policy implemented', () => {
  const crashFile = path.join(projectRoot, 'src/main/crash-telemetry.js');
  if (!fs.existsSync(crashFile)) return false;
  
  const content = fs.readFileSync(crashFile, 'utf-8');
  return content.includes('shouldEnterSafeMode') && content.includes('RINAWARP_SAFE_MODE');
});

// 7. Updates
check('Updater disabled in CI/headless smoke', () => {
  const mainFile = path.join(projectRoot, 'src/main/main.js');
  if (!fs.existsSync(mainFile)) return false;
  
  const content = fs.readFileSync(mainFile, 'utf-8');
  return content.includes('--headless-smoke') && content.includes('autoUpdater');
});

// 8. Security
check('No deprecated Electron APIs', () => {
  const mainFile = path.join(projectRoot, 'src/main/main.js');
  if (!fs.existsSync(mainFile)) return false;
  
  const content = fs.readFileSync(mainFile, 'utf-8');
  const deprecated = [
    'nodeIntegration: true',
    'webviewTag: true',
    'allowRunningInsecureContent: true'
  ];
  
  return !deprecated.some(deprecated => content.includes(deprecated));
});

check('Context isolation enabled', () => {
  const mainFile = path.join(projectRoot, 'src/main/main.js');
  if (!fs.existsSync(mainFile)) return false;
  
  const content = fs.readFileSync(mainFile, 'utf-8');
  return content.includes('contextIsolation: true');
});

// 9. Dependencies
check('Node and Electron versions locked', () => {
  const packageJson = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(packageJson)) return false;
  
  const content = JSON.parse(fs.readFileSync(packageJson, 'utf-8'));
  return content.engines && content.engines.node && content.engines.electron;
});

// 10. Build
check('Electron rebuild configured', () => {
  const packageJson = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(packageJson)) return false;
  
  const content = JSON.parse(fs.readFileSync(packageJson, 'utf-8'));
  return content.scripts && content.scripts.rebuild && content.scripts.rebuild.includes('electron-rebuild');
});

console.log(`\n=== Results ===`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed === 0) {
  console.log('\n✓ All architecture checks passed!');
  process.exit(0);
} else {
  console.log('\n✗ Some architecture checks failed!');
  process.exit(1);
}