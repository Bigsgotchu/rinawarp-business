# Build System & Packaging Configuration

## Overview

This document defines the build system and packaging configuration for the new conversation-first RinaWarp Terminal Pro. The build system prioritizes TypeScript-first development, comprehensive testing, and production-ready distribution.

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development vite",
    "dev:electron": "cross-env NODE_ENV=development concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "build": "npm run build:renderer && npm run build:main && npm run build:types",
    "build:renderer": "vite build",
    "build:main": "tsc -p src/main/tsconfig.json",
    "build:types": "tsc -p src/shared/tsconfig.json --emitDeclarationOnly",
    "start": "electron .",
    "lint": "eslint src --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint src --ext .ts,.tsx,.js,.jsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "build:clean": "rimraf dist out coverage",
    "build:prod": "cross-env NODE_ENV=production npm run build",
    "package": "npm run build:prod && electron-builder",
    "package:mac": "npm run build:prod && electron-builder --mac --x64 --arm64",
    "package:win": "npm run build:prod && electron-builder --win --x64",
    "package:linux": "npm run build:prod && electron-builder --linux --x64",
    "package:all": "npm run build:prod && electron-builder -wl",
    "release": "npm run test && npm run lint && npm run typecheck && npm run build:prod && npm run release:validate",
    "release:validate": "node scripts/validate-release.js",
    "release:publish": "npm run package:all && node scripts/publish-release.js",
    "analyze": "npm run build && npx electron-builder --dir --config electron-builder.config.js",
    "security:audit": "npm audit && npm run security:check",
    "security:check": "node scripts/security-check.js",
    "perf:build": "npm run build -- --mode production",
    "perf:bundle": "npx vite-bundle-analyzer dist",
    "docs:generate": "typedoc src --out docs/api",
    "preflight": "node scripts/preflight.js",
    "postinstall": "electron-builder install-app-deps && npm run rebuild",
    "rebuild": "electron-rebuild -f -w node-pty"
  }
}
```

## TypeScript Configuration

### Root tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Node",
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": false,
    "outDir": "./out",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "out", "tests"]
}
```

### Main Process tsconfig.json

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "outDir": "./dist/main",
    "rootDir": "./main",
    "target": "ES2020"
  },
  "include": ["src/main/**/*"],
  "exclude": ["src/renderer/**/*", "src/shared/**/*"]
}
```

### Renderer Process tsconfig.json

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "outDir": "./dist/renderer",
    "rootDir": "./renderer",
    "target": "ES2020"
  },
  "include": ["src/renderer/**/*"],
  "exclude": ["src/main/**/*", "src/shared/**/*"]
}
```

### Shared Types tsconfig.json

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist/types",
    "rootDir": "./shared",
    "emitDeclarationOnly": true
  },
  "include": ["src/shared/**/*"],
  "exclude": ["src/main/**/*", "src/renderer/**/*"]
}
```

## Vite Configuration

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: './src/renderer',
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/renderer/index.html'),
      },
      output: {
        format: 'es',
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  define: {
    __DEV__: process.env.NODE_ENV === 'development',
    __VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
```

## Electron Builder Configuration

### electron-builder.config.js

```javascript
const path = require('path');

module.exports = {
  appId: 'com.rinawarp.terminalpro',
  productName: 'RinaWarp Terminal Pro',
  copyright: 'Copyright © 2024 RinaWarp Technologies',

  // Build configuration
  buildVersion: process.env.BUILD_NUMBER || '0',
  buildNumber: process.env.BUILD_NUMBER || '0',

  // Directories
  directories: {
    output: 'release',
    buildResources: 'build'
  },

  // Files to include in package
  files: [
    'dist/**/*',
    'node_modules/**/*',
    'package.json',
    '!**/node_modules/*/test/**/*',
    '!**/node_modules/*/docs/**/*',
    '!**/node_modules/*/example/**/*',
    '!**/node_modules/*/examples/**/*'
  ],

  // Extra resources
  extraResources: [
    {
      from: 'agent',
      to: 'agent',
      filter: ['**/*']
    }
  ],

  // ASAR configuration
  asar: {
    smartUnpack: false,
    order: [
      'node_modules/**/*',
      '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
      '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
      '!**/node_modules/*.d.ts',
      '!**/node_modules/.bin',
      '!**/*/node_modules/*/node_modules/fsevents/**/*'
    ]
  },

  // Mac configuration
  mac: {
    category: 'public.app-category.developer-tools',
    icon: 'build/icon.icns',
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      },
      {
        target: 'zip',
        arch: ['x64', 'arm64']
      }
    ],
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist',
    provisioningProfile: process.env.MAC_PROVISIONING_PROFILE
  },

  // Windows configuration
  win: {
    icon: 'build/icon.ico',
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      },
      {
        target: 'zip',
        arch: ['x64']
      }
    ],
    signtoolOptions: {
      subject: 'CN=RinaWarp Technologies Inc',
      certificateFile: process.env.WIN_CSC_LINK,
      certificatePassword: process.env.WIN_CSC_KEY_PASSWORD,
      additionalCertificateFile: process.env.WIN_CSC_INTERMEDIATE
    },
    publisherName: 'RinaWarp Technologies Inc'
  },

  // Linux configuration
  linux: {
    icon: 'build/icon.png',
    category: 'Development',
    target: [
      {
        target: 'AppImage',
        arch: ['x64']
      },
      {
        target: 'deb',
        arch: ['x64']
      },
      {
        target: 'rpm',
        arch: ['x64']
      }
    ],
    desktop: {
      Name: 'RinaWarp Terminal Pro',
      Name[en_US]: 'RinaWarp Terminal Pro',
      GenericName: 'AI-Powered Terminal',
      GenericName[en_US]: 'AI-Powered Terminal',
      Comment: 'Conversation-first terminal with AI assistant',
      Comment[en_US]: 'Conversation-first terminal with AI assistant',
      Keywords: 'terminal;ai;developer;',
      Keywords[en_US]: 'terminal;ai;developer;'
    }
  },

  // Publishing
  publish: [
    {
      provider: 'generic',
      url: process.env.UPDATE_SERVER_URL || 'https://updates.rinawarp.dev/stable'
    }
  ],

  // Environment variables
  environmentVariables: {
    electron: process.env.ELECTRON_VERSION || '20.3.12',
    node: process.env.NODE_VERSION || '20'
  },

  // Compression
  compression: 'maximum',

  // Metadata
  extraMetadata: {
    version: process.env.npm_package_version || '0.4.0'
  },

  // Build hooks
  beforeBuild: async (context) => {
    console.log('🔧 Running pre-build hooks...');

    // Validate environment
    if (!process.env.NODE_ENV) {
      throw new Error('NODE_ENV must be set');
    }

    // Run security checks
    await require('./scripts/security-check').run();

    // Validate build requirements
    await require('./scripts/validate-build').run();
  },

  afterSign: async (context) => {
    console.log('📝 Running post-build hooks...');

    // Generate SBOM
    await require('./scripts/generate-sbom').run(context);

    // Upload symbols for crash reporting
    await require('./scripts/upload-symbols').run(context);
  }
};
```

## ESLint Configuration

### .eslintrc.cjs

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:security/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'security'],
  rules: {
    // TypeScript specific
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',

    // React specific
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Security
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error',

    // General
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'prefer-const': 'error',
    'no-var': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: ['dist/', 'out/', 'node_modules/', 'release/'],
};
```

## Prettier Configuration

### .prettierrc.cjs

```javascript
module.exports = {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  embeddedLanguageFormatting: 'auto',
};
```

## Testing Configuration

### Vitest Configuration

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'out/', 'tests/', '**/*.d.ts', '**/*.config.*'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@main': resolve(__dirname, 'src/main'),
      '@renderer': resolve(__dirname, 'src/renderer'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@components': resolve(__dirname, 'src/renderer/components'),
      '@hooks': resolve(__dirname, 'src/renderer/hooks'),
    },
  },
});
```

### Playwright Configuration

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev:electron',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Build Scripts

### scripts/preflight.js

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running preflight checks...');

// Check Node.js version
const nodeVersion = process.version;
const requiredVersion = 'v20.0.0';
if (nodeVersion < requiredVersion) {
  throw new Error(`Node.js ${requiredVersion} or higher is required. Current: ${nodeVersion}`);
}

// Check pnpm
try {
  execSync('pnpm --version', { stdio: 'ignore' });
} catch {
  throw new Error('pnpm is required but not installed');
}

// Check environment variables
const requiredEnvVars = ['NODE_ENV'];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.warn('⚠️  Missing environment variables:', missingEnvVars.join(', '));
}

// Clean previous builds
const dirsToClean = ['dist', 'out', 'coverage'];
dirsToClean.forEach((dir) => {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`🧹 Cleaned ${dir}`);
  }
});

console.log('✅ Preflight checks completed');
```

### scripts/security-check.js

```javascript
const { execSync } = require('child_process');

console.log('🔒 Running security checks...');

// Check for security vulnerabilities
try {
  execSync('npm audit --audit-level moderate', { stdio: 'inherit' });
  console.log('✅ No moderate or high security vulnerabilities found');
} catch (error) {
  console.error('❌ Security vulnerabilities detected');
  process.exit(1);
}

// Check for suspicious patterns in code
const { execSync } = require('child_process');

try {
  // Check for eval usage
  const evalResults = execSync('grep -r "eval(" src --include="*.ts" --include="*.js" || true', {
    encoding: 'utf8',
  });
  if (evalResults.trim()) {
    console.warn('⚠️  Found eval() usage:');
    console.warn(evalResults);
  }

  // Check for innerHTML usage
  const innerHTMLResults = execSync(
    'grep -r "innerHTML" src --include="*.tsx" --include="*.ts" || true',
    { encoding: 'utf8' },
  );
  if (innerHTMLResults.trim()) {
    console.warn('⚠️  Found innerHTML usage (potential XSS risk):');
    console.warn(innerHTMLResults);
  }

  console.log('✅ Security pattern check completed');
} catch (error) {
  console.warn('⚠️  Security pattern check failed:', error.message);
}

console.log('✅ Security checks completed');
```

## Distribution Pipeline

### GitHub Actions Workflow

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install

      - name: Run linting
        run: pnpm lint

      - name: Run type checking
        run: pnpm typecheck

      - name: Run tests
        run: pnpm test

      - name: Build application
        run: pnpm build:prod
        env:
          NODE_ENV: production

      - name: Build packages
        run: pnpm package
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          WIN_CSC_LINK: ${{ secrets.WIN_CSC_LINK }}
          WIN_CSC_KEY_PASSWORD: ${{ secrets.WIN_CSC_KEY_PASSWORD }}
          MAC_PROVISIONING_PROFILE: ${{ secrets.MAC_PROVISIONING_PROFILE }}

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: packages-${{ matrix.os }}
          path: release/
          retention-days: 30

  release:
    needs: build
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/')

    steps:
      - uses: actions/checkout@v3

      - name: Download artifacts
        uses: actions/download-artifact@v3
        with:
          path: release/

      - name: Create release
        uses: softprops/action-gh-release@v1
        with:
          files: release/**/*
          body: |
            ## Changes in this release

            See [CHANGELOG.md](CHANGELOG.md) for detailed changes.
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Performance Targets

### Build Performance

- **Initial build**: < 30 seconds
- **Incremental build**: < 5 seconds
- **Hot reload**: < 1 second

### Bundle Size Targets

- **Main bundle**: < 2MB
- **Total assets**: < 5MB
- **Initial load**: < 3 seconds on 3G

### Code Quality Targets

- **Test coverage**: > 85%
- **TypeScript strict mode**: 100% compliance
- **ESLint errors**: 0
- **Security vulnerabilities**: 0

This build system provides a robust foundation for developing, testing, and distributing the conversation-first RinaWarp Terminal Pro with confidence.
