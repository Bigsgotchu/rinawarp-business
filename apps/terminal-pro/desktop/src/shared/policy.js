const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const DEFAULTS = {
  capabilities: { docker: false, git: true, npm: true, network: false },
  limits: { timeoutMs: 120000, maxBytes: 2_000_000 },
  policy: { confirmRequired: true, dryRunByDefault: false }
};

function loadPolicy(cwd) {
  try {
    const p = path.join(cwd, '.rinawarp.yaml');
    if (!fs.existsSync(p)) return DEFAULTS;
    const data = yaml.parse(fs.readFileSync(p, 'utf8')) || {};
    return {
      capabilities: { ...DEFAULTS.capabilities, ...(data.capabilities || {}) },
      limits: { ...DEFAULTS.limits, ...(data.limits || {}) },
      policy: { ...DEFAULTS.policy, ...(data.policy || {}) }
    };
  } catch {
    return DEFAULTS;
  }
}

module.exports = { loadPolicy, DEFAULTS };
