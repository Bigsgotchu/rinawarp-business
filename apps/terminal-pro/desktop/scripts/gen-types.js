#!/usr/bin/env node

// TypeScript definitions generator
// Generates rinawarp.d.ts from src/shared/ipc-map.ts

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('=== Generating TypeScript Definitions ===\n');

const ipcMapPath = path.join(projectRoot, 'src/shared/ipc-map.ts');
const outputPath = path.join(projectRoot, 'rinawarp.d.ts');

if (!fs.existsSync(ipcMapPath)) {
  console.error('❌ IPC map file not found:', ipcMapPath);
  process.exit(1);
}

// Read the IPC map file
const ipcMapContent = fs.readFileSync(ipcMapPath, 'utf-8');

// Extract channel definitions using regex
const channelRegex = /(\w+):\s*{\s*([^}]+)\s*}/g;
const channels = [];

let match;
while ((match = channelRegex.exec(ipcMapContent)) !== null) {
  const groupName = match[1];
  const groupContent = match[2];
  
  const methodRegex = /(\w+):\s*['"]([^'"]+)['"]/g;
  let methodMatch;
  
  while ((methodMatch = methodRegex.exec(groupContent)) !== null) {
    const methodName = methodMatch[1];
    const channelName = methodMatch[2];
    channels.push({ group: groupName, method: methodName, channel: channelName });
  }
}

// Generate TypeScript definitions
const typeDefinitions = channels.map(ch => {
  const interfaceName = `${ch.group.charAt(0).toUpperCase() + ch.group.slice(1)}${ch.method.charAt(0).toUpperCase() + ch.method.slice(1)}`;
  return `  '${ch.channel}': ${interfaceName};`;
}).join('\n');

const electronAPIInterface = channels.reduce((acc, ch) => {
  const group = ch.group;
  const method = ch.method;
  const channel = ch.channel;
  
  if (!acc[group]) {
    acc[group] = {};
  }
  
  acc[group][method] = `() => Promise<any>`;
  return acc;
}, {});

const electronAPI = Object.entries(electronAPIInterface).map(([group, methods]) => {
  const groupMethods = Object.entries(methods).map(([method, signature]) => {
    return `    ${method}: ${signature};`;
  }).join('\n');
  
  return `  ${group}: {\n${groupMethods}\n  };`;
}).join('\n');

const template = `// Auto-generated TypeScript definitions for RinaWarp Terminal Pro
// This file is generated from src/shared/ipc-map.ts and provides type safety

export interface IPCChannels {
${typeDefinitions}
}

// Type-safe IPC renderer interface
export interface ElectronAPI {
${electronAPI}
}

// Expose types to global scope
declare global {
  interface Window {
    electronAPI: ElectronAPI;
    ipcChannels: typeof import('./src/shared/ipc-map').IPC_CHANNELS;
  }
}
`;

// Write the output file
fs.writeFileSync(outputPath, template);

console.log(`✓ Generated TypeScript definitions: ${outputPath}`);
console.log(`✓ Defined ${channels.length} IPC channels`);

// Also update package.json scripts
const packageJsonPath = path.join(projectRoot, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  packageJson.scripts['gen:types'] = 'node scripts/gen-types.js';
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✓ Updated package.json with gen:types script');
}

console.log('\n=== TypeScript Definitions Generated Successfully ===');