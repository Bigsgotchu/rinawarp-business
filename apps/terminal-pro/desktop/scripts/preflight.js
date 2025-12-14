/* Why: catch Node-only launches before Electron initializes. */
if (!process.versions || !process.versions.node) {
  console.error('Unexpected runtime (no Node version).'); process.exit(1);
}
if (!process.versions.electron) {
  console.error(
    'ERROR: Not running under Electron. Use `npm run dev` or `npm start`.\n' +
    'If you set ELECTRON_RUN_AS_NODE before, it has been unset for this run.'
  );
  process.exit(1);
}
