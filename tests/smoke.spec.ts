import { test, expect } from '@playwright/test';

const appId = process.env.D365_APP_ID ? `&appid=${process.env.D365_APP_ID}` : '';

test('la app carga y muestra la navegación', async ({ page }) => {
  await page.goto(`/main.aspx?${appId.slice(1)}`);
  await expect(page.locator('[data-id="appBreadCrumb"], [data-id="sitemap-sitemapAreaSwitcher-expand-btn"]').first()).toBeVisible();
});

test('la vista de cuentas lista registros', async ({ page }) => {
  await page.goto(`/main.aspx?pagetype=entitylist&etn=account${appId}`);
  await expect(page.locator('[role="grid"], [role="treegrid"], [data-id="grid-container"], [data-lp-id*="grid"]').first()).toBeVisible();
});

test('el formulario de nueva cuenta abre', async ({ page }) => {
  await page.goto(`/main.aspx?pagetype=entityrecord&etn=account${appId}`);
  await expect(page.locator('[data-id="name.fieldControl-text-box-text"]')).toBeVisible();
});
