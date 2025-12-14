const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const DEFAULTS = {
  capabilities: { docker: false, git: true, npm: true, network: false },
  limits: { timeoutMs: 120000, maxBytes: 2_000_000 },
  policy: {
    confirmRequired: true,
    dryRunByDefault: false,
    concurrency: 4,              // max parallel steps
    stepPolicy: [                // optional per-step overrides
      // { match: { id: 'build' }, timeoutMs: 300000, maxRetries: 2, retryBackoffMs: 800 }
      // { match: { capability: 'network' }, maxRetries: 3, retryBackoffMs: 1000 }
    ]
  }
};

function loadPolicy(cwd) {
  try {
    const p = path.join(cwd, '.rinawarp.yaml');
    if (!fs.existsSync(p)) return DEFAULTS;
    const data = yaml.parse(fs.readFileSync(p, 'utf8')) || {};
    const merged = {
      capabilities: { ...DEFAULTS.capabilities, ...(data.capabilities || {}) },
      limits: { ...DEFAULTS.limits, ...(data.limits || {}) },
      policy: {
        ...DEFAULTS.policy,
        ...(data.policy || {}),
        stepPolicy: Array.isArray(data?.policy?.stepPolicy) ? data.policy.stepPolicy : DEFAULTS.policy.stepPolicy
      }
    };
    // clamp concurrency
    if (merged.policy.concurrency < 1) merged.policy.concurrency = 1;
    if (merged.policy.concurrency > 16) merged.policy.concurrency = 16;
    return merged;
  } catch {
    return DEFAULTS;
  }
}

function validatePolicy(cwd) {
  try {
    const p = path.join(cwd, '.rinawarp.yaml');
    if (!fs.existsSync(p)) return { ok: false, error: 'file not found' };
    const data = yaml.parse(fs.readFileSync(p, 'utf8'));
    if (!data) return { ok: false, error: 'invalid yaml' };
    // basic checks
    if (typeof data.capabilities !== 'object') return { ok: false, error: 'capabilities not object' };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

module.exports = { loadPolicy, validatePolicy, DEFAULTS };
