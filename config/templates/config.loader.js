// Central config loader (template)
// Usage: import validateConfig from '../config/templates/config.loader'

const fs = require('fs');
const path = require('path');

function loadEnvFile(fileName) {
  const fullPath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(fullPath)) return {};
  const content = fs.readFileSync(fullPath, 'utf8');
  return Object.fromEntries(
    content.split(/\r?\n/).filter(Boolean).map(line => {
      const idx = line.indexOf('=');
      if (idx === -1) return [line.trim(), ''];
      const key = line.trim();
      const val = line.slice(idx + 1).trim();
      return [key, val];
    })
  );
}

function loadConfig() {
  const env = process.env.APP_ENV || 'development';
  const base = loadEnvFile('.env');
  const specific = env === 'production'
    ? loadEnvFile('.env.production')
    : loadEnvFile('.env.development');

  return { ...base, ...specific, ...process.env };
}

module.exports = {
  loadConfig,
};

