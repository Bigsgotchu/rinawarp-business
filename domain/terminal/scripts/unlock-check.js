// scripts/unlock-check.js
import fs from 'fs';
import path from 'path';

const unlockFile = path.join(
  process.env.HOME || process.env.USERPROFILE,
  '.rinawarp-unlocked'
);

if (!fs.existsSync(unlockFile)) {
  console.error(`
  🔒 This version of RinaWarp Terminal Pro is locked.

  To unlock full access:
  👉 Visit: https://rinawarptech.com/download
  🧾 Enter your license key after purchase

  ❗ Exiting...
  `);
  process.exit(1);
} else {
  console.log('✅ Full version unlocked. Starting app...');
}
