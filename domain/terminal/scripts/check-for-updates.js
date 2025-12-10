import fetch from 'node-fetch';
import { execSync } from 'child_process';
import pkg from '../package.json' assert { type: 'json' };

const LOCAL_VERSION = pkg.version;
const REMOTE_URL = 'https://rinawarptech.com/releases/latest.json'; // This file needs to exist

async function check() {
  try {
    const res = await fetch(REMOTE_URL);
    const data = await res.json();
    const remoteVersion = data.version;

    if (remoteVersion !== LOCAL_VERSION) {
      console.log(`🚀 Update available: ${remoteVersion}`);
      console.log(`➡️ Download: ${data.url}`);
      // Optional: trigger download or auto-update
    } else {
      console.log('✅ You are running the latest version.');
    }
  } catch (err) {
    console.error('❌ Failed to check for updates:', err);
  }
}

check();
