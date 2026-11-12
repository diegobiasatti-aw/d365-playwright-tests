import { test as setup } from '@playwright/test';
import fs from 'fs';
import { STORAGE_STATE } from '../playwright.config';

// Local: run `npm run auth` and log in manually (MFA ok); the session is saved to .auth/state.json.
// CI: provide the saved session via the D365_STORAGE_STATE secret (JSON), or use a service account.
setup('authenticate', async ({ page }) => {
  setup.setTimeout(10 * 60_000);
  fs.mkdirSync('.auth', { recursive: true });

  if (process.env.D365_STORAGE_STATE) {
    fs.writeFileSync(STORAGE_STATE, process.env.D365_STORAGE_STATE);
    return;
  }
  if (fs.existsSync(STORAGE_STATE) && !process.env.FORCE_LOGIN) return;

  await page.goto('/');
  const origin = new URL(process.env.D365_URL!).origin;
  await page.waitForURL((u) => u.origin === origin, { timeout: 5 * 60_000 });
  await page.waitForLoadState('networkidle', { timeout: 60_000 }).catch(() => {});
  await page.context().storageState({ path: STORAGE_STATE });
});
