#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting pre-build preparations for RinaWarp Terminal Pro...');

// Ensure build directories exist
const dirs = ['dist', 'release'];
dirs.forEach((dir) => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Clean previous builds
const releaseDir = path.join(__dirname, '..', 'release');
if (fs.existsSync(releaseDir)) {
  fs.rmSync(releaseDir, { recursive: true, force: true });
  fs.mkdirSync(releaseDir, { recursive: true });
  console.log('🧹 Cleaned previous build artifacts');
}

// Update build timestamp
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
);
const buildInfo = {
  buildTime: new Date().toISOString(),
  version: packageJson.version,
  platform: process.platform,
  arch: process.arch,
};

fs.writeFileSync(
  path.join(__dirname, '..', 'build-info.json'),
  JSON.stringify(buildInfo, null, 2)
);

console.log('✅ Build info generated');
console.log('📦 Pre-build preparations complete');
