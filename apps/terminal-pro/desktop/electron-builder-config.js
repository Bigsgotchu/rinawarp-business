module.exports = {
  directories: { output: 'dist' },

  artifactName: '${productName}-${version}-${os}-${arch}.${ext}',

  win: {
    target: [{ target: 'nsis', arch: ['x64'] }],
    // also produce .blockmap for differential updates
    publisherName: 'RinaWarp Technologies',
    // keep your signing fields as-is...
  },

  mac: {
    target: [
      { target: 'zip', arch: ['x64', 'arm64'] },
      { target: 'dmg', arch: ['x64', 'arm64'] },
    ],
    // keep your signing/notarization config as-is...
  },

  linux: {
    target: [{ target: 'AppImage', arch: ['x64'] }],
  },

  // Do not auto-publish from EB; we publish ourselves to R2/Pages
  publish: null,
};
