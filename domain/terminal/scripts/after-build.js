#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Running post-build processing for RinaWarp Terminal Pro...');

// Generate checksums for security verification
const releaseDir = path.join(__dirname, '..', 'release');
const buildInfo = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'build-info.json'), 'utf8')
);

if (fs.existsSync(releaseDir)) {
  const artifacts = fs.readdirSync(releaseDir);

  artifacts.forEach((artifact) => {
    const artifactPath = path.join(releaseDir, artifact);

    if (fs.statSync(artifactPath).isFile()) {
      try {
        // Generate SHA256 checksum
        const checksum = execSync(`sha256sum "${artifactPath}"`)
          .toString()
          .split(' ')[0];
        fs.writeFileSync(`${artifactPath}.sha256`, checksum);
        console.log(`✅ Generated checksum for: ${artifact}`);
      } catch (error) {
        console.warn(`⚠️  Could not generate checksum for: ${artifact}`);
      }
    }
  });
}

// Update package.json with build metadata
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

packageJson.buildInfo = buildInfo;
packageJson.lastBuild = new Date().toISOString();

fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

console.log('📋 Updated package metadata');
console.log('✅ Post-build processing complete');
