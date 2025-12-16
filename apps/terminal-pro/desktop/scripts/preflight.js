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

// Preflight checks for RinaWarp Terminal Pro
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

function runCommand(cmd, description) {
  try {
    console.log(`\n🔍 Checking: ${description}`);
    const result = execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    console.log('✅ Passed');
    if (result.trim()) console.log(result.trim());
    return true;
  } catch (error) {
    console.log('❌ Failed');
    console.error(error.stdout || error.stderr);
    return false;
  }
}

function checkSigning() {
  console.log('\n📋 Signing / Notarization Checks');

  // macOS
  if (process.platform === 'darwin') {
    runCommand(
      `spctl -a -vv -t install "${distDir}/mac/RinaWarp Terminal Pro.dmg"`,
      'macOS Gatekeeper assessment',
    );
    runCommand(
      `xcrun stapler validate "${distDir}/mac/RinaWarp Terminal Pro.app"`,
      'macOS notarization',
    );
  }

  // Windows
  if (process.platform === 'win32') {
    runCommand(
      `signtool verify /pa /all "${distDir}/win-unpacked/RinaWarpTerminalPro.exe"`,
      'Windows Authenticode',
    );
  }

  // Linux
  if (process.platform === 'linux') {
    const sigFiles = fs.readdirSync(path.join(distDir, 'linux')).filter((f) => f.endsWith('.sig'));
    sigFiles.forEach((sig) => {
      runCommand(`gpg --verify "${distDir}/linux/${sig}"`, `Linux signature: ${sig}`);
    });
  }
}

function checkAutoUpdate() {
  console.log('\n🔄 Auto-update Hardening Checks');

  const files = ['latest-mac.yml', 'latest.yml'];
  files.forEach((file) => {
    const filePath = path.join(distDir, file);
    if (fs.existsSync(filePath)) {
      runCommand(`jq '.path,.sha512' "${filePath}"`, `Update feed: ${file}`);
    }
  });
}

function runtimeChecksNote() {
  console.log('\n🌐 Runtime Checks (Manual - Open DevTools Console):');
  console.log('• self.crossOriginIsolated === true');
  console.log('• await crypto.subtle.digest("SHA-256", new TextEncoder().encode("ok"))');
  console.log('• document.querySelector(\'meta[http-equiv="Content-Security-Policy"]\').content');
  console.log("• await fetch('app://index.html').then(r => r.headers.get('content-type'))");
  console.log("• await fetch('app://assets/engine.wasm').then(r => r.headers.get('content-type'))");
  console.log('• Object.isFrozen(window.bridge)');
  console.log('• Object.getOwnPropertyNames(window.bridge)');
  console.log('• window.location.assign("https://example.com") // should be blocked');
  console.log(
    '• console.info("token=sk-live-THIS_IS_FAKE_ONLY_FOR_TESTING") // check logs for [REDACTED]',
  );
}

function performanceNote() {
  console.log('\n⚡ Performance Guardrails (Launch with metrics):');
  console.log('RINAWARP_DEBUG=1 ./RinaWarpTerminalPro --profile-start');
  console.log('Expect: cold start < 2000ms, renderer RSS < 200MB after 5min idle');
}

// Run checks
checkSigning();
checkAutoUpdate();
runtimeChecksNote();
performanceNote();

console.log('\n🎯 Preflight complete. Review output above.');
