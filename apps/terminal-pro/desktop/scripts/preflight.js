/* Why: catch Node-only launches before Electron initializes. */
if (!process.versions || !process.versions.node) {
  console.error('Unexpected runtime (no Node version).');
  process.exit(1);
}
if (process.env.ELECTRON_RUN_AS_NODE) {
  console.error(
    'ERROR: ELECTRON_RUN_AS_NODE is still set. Unset failed.\n' +
      'Use `npm run dev` or `npm start` which will unset it.',
  );
  process.exit(1);
}
console.log('Preflight: ELECTRON_RUN_AS_NODE is properly unset.');
