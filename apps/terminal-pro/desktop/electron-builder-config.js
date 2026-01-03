/**
 * Electron Builder configuration for AppImage releases
 * Optimized for node-pty and staging builds
 */

module.exports = {
  // App metadata
  appId: 'com.rinawarp.terminal-pro',
  productName: 'Rinawarp Terminal Pro',
  "files": ["out/**/*", "dist/renderer/**/*", "node_modules/**/*"],

  // Directories
  directories: {
    output: 'dist-terminal-pro',
    buildResources: 'assets',
  },

  // Linux AppImage configuration
  linux: {
    target: [
      {
        target: 'AppImage',
        arch: ['x64'],
      },
    ],
    category: 'Development',
    desktop: {
      entry: {
      Name: 'Rinawarp Terminal Pro',
      Comment: 'Professional Terminal Application',
      Keywords: 'terminal;development;productivity;'
      },
    },
    // Critical: Only unpack .node files, not entire node_modules
    asarUnpack: ['**/*.node'],
    // Ensure proper file associations and execution
    executableName: 'terminal-pro',
    executableArgs: [],
  },

  // AppImage specific configuration
  appImage: {
    artifactName: '${productName}-${version}-${arch}.${ext}',
    category: 'Development',
    // Enable FUSE for better compatibility
    // Include latest runtime
  },

  // Native module rebuild configuration
  // This ensures node-pty is properly rebuilt for Electron

  // Build environment
  nodeGypRebuild: false,
  buildDependenciesFromSource: false,

  // Compression and optimization
  compression: 'maximum',

  // Code signing (add your certificates if needed)
  // certificateFile: process.env.CSC_LINK,
  // certificatePassword: process.env.CSC_KEY_PASSWORD,

  // Publish configuration (set to never for CI, will be handled by GitHub Actions)
  publish: {
    provider: 'generic',
    url: '',
  },
};
