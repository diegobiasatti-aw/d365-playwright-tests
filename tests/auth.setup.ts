import { test as setup, expect } from '@playwright/test';
import fs from 'fs';
import { STORAGE_STATE } from '../playwright.config';

// Local: run `npm run auth` and log in manually (MFA ok); the session is saved to .auth/state.json.
// CI: provide the saved session via the D365_STORAGE_STATE secret (JSON), or use a service account.
setup('authenticate', async ({ page }) => {
  fs.mkdirSync('.auth', { recursive: true });

  if (process.env.D365_STORAGE_STATE) {
    fs.writeFileSync(STORAGE_STATE, process.env.D365_STORAGE_STATE);
    return;
  }
  if (fs.existsSync(STORAGE_STATE) && !process.env.FORCE_LOGIN) return;

  await page.goto('/');
  await page.waitForURL(/\.dynamics\.com\/main\.aspx/, { timeout: 5 * 60_000 });
  await expect(page.locator('[data-id="sitemap-sitemapAreaSwitcher-expand-btn"], #sitemap-areaSwitcher-expand-btn').first()).toBeVisible({ timeout: 60_000 });
  await page.context().storageState({ path: STORAGE_STATE });
});
