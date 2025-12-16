import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';

const DIR = path.join(os.homedir(), '.rinawarp');
const FILE = path.join(DIR, 'audit.jsonl');
const KEYFILE = path.join(DIR, 'audit.key');

function ensure() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
  if (!fs.existsSync(KEYFILE)) fs.writeFileSync(KEYFILE, crypto.randomBytes(32).toString('hex'));
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '');
}
function key() {
  ensure();
  return fs.readFileSync(KEYFILE, 'utf8').trim();
}

export function auditWrite(event, payload) {
  try {
    ensure();
    const ts = Date.now();
    const data = { ts, event, payload };
    const h = crypto.createHmac('sha256', key()).update(JSON.stringify(data)).digest('hex');
    fs.appendFileSync(FILE, JSON.stringify({ ...data, h }) + '\n');
  } catch {
    /* never throw */
  }
}
