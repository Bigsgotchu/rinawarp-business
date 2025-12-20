const Store = require('electron-store');
const store = new Store({ name: 'settings' });

const DEFAULT_CAPS = { docker: false, git: true, npm: true, network: false };

function getCapabilities(workdir) {
  const all = store.get('capabilities', {});
  return { ...DEFAULT_CAPS, ...(all[workdir] || {}) };
}
function setCapabilities(workdir, caps) {
  const all = store.get('capabilities', {});
  all[workdir] = { ...getCapabilities(workdir), ...caps };
  store.set('capabilities', all);
  return all[workdir];
}
function capabilityNeededFor(command) {
  const first = command.trim().split(/\s+/)[0];
  if (first === 'docker') return 'docker';
  if (first === 'git') return 'git';
  if (first === 'npm' || first === 'npx') return 'npm';
  if (/pip|python3?/.test(first) && /install/.test(command)) return 'network';
  return null;
}
function isCapabilityAllowed(caps, cap) { return !cap || !!caps[cap]; }

module.exports = { getCapabilities, setCapabilities, capabilityNeededFor, isCapabilityAllowed };
