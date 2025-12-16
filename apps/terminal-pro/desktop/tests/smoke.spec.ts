import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';

test('app starts and shows title', async () => {
  const app = await electron.launch({
    args: ['.'],
    env: {
      ...process.env,
      ELECTRON_DISABLE_SANDBOX: '1', // CI only; harmless locally
      ELECTRON_ENABLE_LOGGING: '1',
    },
  });
  const win = await app.firstWindow();
  await expect(win).toHaveTitle(/RinaWarp Terminal Pro/);
  await app.close();
});

test('security: bridge is frozen and functional', async () => {
  const app = await electron.launch({
    args: ['.'],
    env: {
      ...process.env,
      ELECTRON_DISABLE_SANDBOX: '1',
    },
  });
  const win = await app.firstWindow();

  // Test bridge API availability
  const bridgeExists = await win.evaluate(() => !!window.bridge);
  expect(bridgeExists).toBe(true);

  // Test bridge is frozen (can't add properties)
  const canModify = await win.evaluate(() => {
    try {
      window.bridge.testProp = 'test';
      return !!window.bridge.testProp;
    } catch {
      return false;
    }
  });
  expect(canModify).toBe(false);

  // Test secure IPC calls work
  const version = await win.evaluate(async () => {
    return await window.bridge?.getAppVersion();
  });
  expect(typeof version).toBe('string');
  expect(version.length).toBeGreaterThan(0);

  await app.close();
});

test('security: navigation blocked', async () => {
  const app = await electron.launch({
    args: ['.'],
    env: {
      ...process.env,
      ELECTRON_DISABLE_SANDBOX: '1',
    },
  });
  const win = await app.firstWindow();

  // Try to navigate (should be blocked)
  await win.evaluate(() => {
    window.location.href = 'https://evil.com';
  });

  // Should still be on app URL
  const url = win.url();
  expect(url).not.toContain('evil.com');

  await app.close();
});

test('security: external URL validation', async () => {
  const app = await electron.launch({
    args: ['.'],
    env: {
      ...process.env,
      ELECTRON_DISABLE_SANDBOX: '1',
    },
  });
  const win = await app.firstWindow();

  // Test valid URL (should work)
  const validResult = await win.evaluate(async () => {
    try {
      await window.bridge?.openExternal('https://example.com');
      return 'success';
    } catch (e) {
      return 'error: ' + e.message;
    }
  });
  expect(validResult).toBe('success');

  // Test invalid URL (should fail)
  const invalidResult = await win.evaluate(async () => {
    try {
      await window.bridge?.openExternal('javascript:alert(1)');
      return 'success';
    } catch (e) {
      return 'error: ' + e.message;
    }
  });
  expect(invalidResult).toContain('error');

  await app.close();
});
