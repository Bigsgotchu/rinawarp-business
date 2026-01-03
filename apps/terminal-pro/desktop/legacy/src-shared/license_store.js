const fs = require('fs');
const os = require('os');
const path = require('path');

const DIR = path.join(os.homedir(), '.rinawarp');
const FILE = path.join(DIR, 'license.json');
const TTL_MS = 365 * 24 * 60 * 60 * 1000; // 1 year offline grace (adjust)

function read() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return null; }
}
function write(data) {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}
function clear() { try { fs.unlinkSync(FILE); } catch {} }

function isValidCached(now = Date.now()) {
  const lic = read(); if (!lic) return false;
  if (!lic.email || !lic.key || !lic.ok) return false;
  return (now - (lic.verifiedAt||0)) < TTL_MS;
}

module.exports = { read, write, clear, isValidCached, FILE };
