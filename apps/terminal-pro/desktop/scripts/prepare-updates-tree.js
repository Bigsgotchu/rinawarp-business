#!/usr/bin/env node

/**
 * Prepare updates tree for Pages deployment
 * Creates the folder structure and copies artifacts for stable/beta/dev channels
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class UpdatesTreePreparer {
  constructor() {
    this.version = require('../package.json').version;
    this.distDir = path.join(__dirname, '..', 'dist');
    this.updatesDir = path.join(this.distDir, 'updates');
    this.stableDir = path.join(this.updatesDir, 'stable');
    this.releasesDir = path.join(this.updatesDir, 'releases', this.version);
  }

  async prepare() {
    console.log('📁 Preparing updates tree for Pages deployment...\n');

    // Ensure dist exists
    if (!fs.existsSync(this.distDir)) {
      throw new Error('dist directory not found. Run build first.');
    }

    // Create directories
    this.createDirectories();

    // Copy artifacts to stable
    this.copyToStable();

    // Copy to releases
    this.copyToReleases();

    // Generate _headers
    this.generateHeaders();

    console.log('✅ Updates tree prepared successfully!');
    console.log(`\nDirectory structure:`);
    console.log(`${this.updatesDir}/`);
    console.log(`├── stable/`);
    console.log(`│   ├── latest.yml`);
    console.log(`│   ├── latest-mac.yml`);
    console.log(`│   ├── RinaWarpTerminalPro-${this.version}.exe`);
    console.log(`│   ├── RinaWarp Terminal Pro-${this.version}.zip`);
    console.log(`│   ├── RinaWarp Terminal Pro-${this.version}.dmg`);
    console.log(`│   ├── RinaWarp-Terminal-Pro-${this.version}.AppImage`);
    console.log(`│   ├── sbom-${this.version}.spdx.json`);
    console.log(`│   ├── SHA256SUMS`);
    console.log(`│   └── SHA256SUMS.sig`);
    console.log(`├── releases/${this.version}/`);
    console.log(`│   └── (same files)`);
    console.log(`└── _headers`);
  }

  createDirectories() {
    console.log('📁 Creating directories...');
    [this.updatesDir, this.stableDir, this.releasesDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  copyToStable() {
    console.log('📋 Copying feeds and metadata to stable...');

    // Clean stable directory first
    if (fs.existsSync(this.stableDir)) {
      fs.readdirSync(this.stableDir).forEach((file) => {
        fs.unlinkSync(path.join(this.stableDir, file));
      });
    }

    // Only copy feeds and metadata to stable/, not large binaries
    const stableFiles = [
      'latest.yml',
      'latest-mac.yml',
      'latest-linux.yml',
      `sbom-${this.version}.spdx.json`,
      'SHA256SUMS',
      'SHA256SUMS.sig',
    ];

    stableFiles.forEach((file) => {
      const src = path.join(this.distDir, file);
      const dst = path.join(this.stableDir, file);

      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dst);
        console.log(`  Copied: ${file}`);
      } else {
        console.log(`  ⚠️  Missing: ${file}`);
      }
    });
  }

  copyToReleases() {
    console.log('📋 Copying artifacts to releases...');

    // Copy all files from stable to releases/version
    const files = fs.readdirSync(this.stableDir);
    files.forEach((file) => {
      const src = path.join(this.stableDir, file);
      const dst = path.join(this.releasesDir, file);
      fs.copyFileSync(src, dst);
    });

    console.log(`  Copied ${files.length} files to releases/${this.version}/`);
  }

  generateHeaders() {
    console.log('📄 Generating _headers file...');

    const headers = `# Release artifacts - explicit MIME types for binary files
/releases/*.exe
  Content-Type: application/octet-stream
  Cache-Control: public, max-age=31536000, immutable

/releases/*.msi
  Content-Type: application/x-msi
  Cache-Control: public, max-age=31536000, immutable

/releases/*.dmg
  Content-Type: application/x-apple-diskimage
  Cache-Control: public, max-age=31536000, immutable

/releases/*.zip
  Content-Type: application/zip
  Cache-Control: public, max-age=31536000, immutable

/releases/*.7z
  Content-Type: application/x-7z-compressed
  Cache-Control: public, max-age=31536000, immutable

/releases/*.tar.gz
  Content-Type: application/gzip
  Cache-Control: public, max-age=31536000, immutable

/releases/*.AppImage
  Content-Type: application/octet-stream
  Cache-Control: public, max-age=31536000, immutable

/releases/*.appimage
  Content-Type: application/octet-stream
  Cache-Control: public, max-age=31536000, immutable

/releases/*.blockmap
  Content-Type: application/octet-stream
  Cache-Control: public, max-age=31536000, immutable

/releases/*.spdx.json
  Content-Type: application/json
  Cache-Control: public, max-age=31536000, immutable

# Stable channel - YAML feeds with no-cache, binaries with long cache
/stable/*.yml
  Content-Type: text/yaml; charset=utf-8
  Cache-Control: no-store
  Access-Control-Allow-Origin: *
  X-Content-Type-Options: nosniff

/stable/*.yaml
  Content-Type: text/yaml; charset=utf-8
  Cache-Control: no-store
  Access-Control-Allow-Origin: *
  X-Content-Type-Options: nosniff

# Binary files
/**/*.dmg
  Content-Type: application/x-apple-diskimage
  Cache-Control: public, max-age=31536000, immutable

/**.zip
  Content-Type: application/zip
  Cache-Control: public, max-age=31536000, immutable

/**/*.7z
  Content-Type: application/x-7z-compressed
  Cache-Control: public, max-age=31536000, immutable

/**/*.tar.gz
  Content-Type: application/gzip
  Cache-Control: public, max-age=31536000, immutable

/**/*.AppImage
  Content-Type: application/octet-stream
  Cache-Control: public, max-age=31536000, immutable

/**/*.appimage
  Content-Type: application/octet-stream
  Cache-Control: public, max-age=31536000, immutable

/**/*.blockmap
  Content-Type: application/octet-stream
  Cache-Control: public, max-age=31536000, immutable

/**/*.exe
  Content-Type: application/octet-stream
  Cache-Control: public, max-age=31536000, immutable

/**/*.msi
  Content-Type: application/x-msi
  Cache-Control: public, max-age=31536000, immutable

/**/*.wasm
  Content-Type: application/wasm
  Cross-Origin-Resource-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
  Cache-Control: public, max-age=31536000, immutable

/**/*.ttf
  Content-Type: font/ttf
  Cache-Control: public, max-age=31536000, immutable

/**/*.woff2
  Content-Type: font/woff2
  Cache-Control: public, max-age=31536000, immutable

# Releases - immutable permalinks
/releases/*
  Cache-Control: public, max-age=31536000, immutable
`;

    const headersPath = path.join(this.updatesDir, '_headers');
    fs.writeFileSync(headersPath, headers);
    console.log(`  Generated: _headers`);

    // Copy _headers to stable for Pages deployment
    const stableHeadersPath = path.join(this.stableDir, '_headers');
    fs.copyFileSync(headersPath, stableHeadersPath);
    console.log(`  Copied: _headers to stable/`);
  }
}

// CLI interface
if (require.main === module) {
  const preparer = new UpdatesTreePreparer();
  preparer.prepare().catch(console.error);
}

module.exports = UpdatesTreePreparer;
