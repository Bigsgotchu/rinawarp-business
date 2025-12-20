import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';

test('app starts and shows title', async () => {
  const app = await electron.launch({
    args: ['.'],
    env: {
      ...process.env,
      ELECTRON_DISABLE_SANDBOX: '1',       // CI only; harmless locally
      ELECTRON_ENABLE_LOGGING: '1'
    }
  });
  const win = await app.firstWindow();
  await expect(win).toHaveTitle(/RinaWarp Terminal Pro/);
  await app.close();
});
