import { test, expect, Page } from '@playwright/test';

test.use({ viewport: { width: 1600, height: 1000 } });

async function pickFirstLookup(page: Page, input: ReturnType<Page['locator']>, search?: string) {
  await input.scrollIntoViewIfNeeded();
  await input.click();
  if (search) await input.pressSequentially(search, { delay: 100 });
  else await input.press('Enter');
  const first = page.locator('[role="listbox"] [role="option"], [role="option"], [data-id*="lookup-results"] li, [id*="LookupResultsDropdown"] li').first();
  await first.waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
  if (await first.isVisible()) await first.click();
  await page.waitForTimeout(1000);
}

async function pickOption(page: Page, name: RegExp, optionText?: string) {
  await page.getByRole('combobox', { name }).first().click();
  const options = page.getByRole('option');
  const opt = optionText
    ? options.filter({ hasText: optionText }).first()
    : options.filter({ hasNotText: /Seleccionar|^---$/ }).first();
  await expect(opt).toBeVisible();
  await opt.click();
}

test('alta de prospecto con campos obligatorios', async ({ page }) => {
  const stamp = Date.now().toString();
  const doc = process.env.D365_TEST_DNI;
  if (!doc) throw new Error('Definí D365_TEST_DNI en .env con un DNI de prueba válido');

  await page.goto(`/main.aspx?appid=${process.env.D365_APP_ID}&pagetype=entityrecord&etn=lead`);
  await page.getByText('Estado del Prospecto', { exact: true }).first().waitFor({ timeout: 60_000 });

  // Cabecera: Tipo de Prospecto y Sucursal (obligatorios)
  await page.waitForTimeout(3000);
  await page.mouse.click(1543, 184);
  await pickOption(page, /Tipo de Prospecto/i, 'Persona Humana');
  await pickFirstLookup(page, page.getByRole('combobox', { name: /Sucursal/i }).or(page.getByLabel(/Sucursal/i)).first());
  await page.mouse.click(800, 700);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'test-results/antes-datos.png' });

  // Datos personales: Nombre/Apellido se habilitan tras completar el documento
  await pickOption(page, /^Tipo de Documento$/i);
  const docInput = page.getByLabel(/^Número de documento/).first();
  await docInput.click();
  await docInput.fill(doc);
  await docInput.press('Tab');
  await pickOption(page, /^Género$/i);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'test-results/despues-doc.png' });

  await page.getByRole('menuitem', { name: /Consulta Nosis/ }).click();
  await page.waitForTimeout(10_000);
  await page.screenshot({ path: 'test-results/despues-nosis.png' });

  // Nosis completa Nombre y Apellido (campos de solo lectura)
  await expect(page.getByLabel(/^Nombre/).first()).not.toHaveValue('', { timeout: 30_000 });
  await expect(page.getByLabel(/^Apellido/).first()).not.toHaveValue('');
  const nombre = await page.getByLabel(/^Nombre/).first().inputValue();

  // Origen (lookup obligatorio)
  await pickFirstLookup(page, page.getByLabel(/^Origen/).first());

  // Localidad (lookup) y datos de contacto obligatorios
  const loc = page.locator('[data-id="aw_localidad.fieldControl-LookupResultsDropdown_aw_localidad_textInputBox_with_filter_new"]');
  await loc.scrollIntoViewIfNeeded();
  await loc.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('San', { delay: 100 });
  await page.waitForTimeout(3000);
  await page.getByText('SAN ADOLFO', { exact: true }).first().click();
  await page.waitForTimeout(1000);
  await expect(page.getByText('SAN ADOLFO', { exact: true }).first()).toBeVisible();
  await page.screenshot({ path: 'test-results/localidad.png' });
  await page.getByLabel(/^Teléfono 1/).first().fill('1155550000');
  await page.getByLabel(/^Email 1/).first().fill('qa.prueba@example.com');

  const modal = page.locator('[id^="modalDialogRoot"]').first();
  if (await modal.isVisible()) {
    await page.screenshot({ path: 'test-results/modal.png' });
    throw new Error('Diálogo bloqueante: ' + (await modal.innerText()).replace(/\s+/g, ' '));
  }
  await page.locator('[data-id$="Mscrm.Form.lead.Save"], [aria-label="Guardar"]').or(page.getByText('Guardar', { exact: true })).first().click();
  await page.waitForTimeout(6000);
  const notif = page.getByText(/Tiene \d+ notificaciones/).first();
  if (await notif.isVisible()) {
    await notif.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/notificaciones.png' });
    const texto = await page.locator('[id*="notification"], [data-id*="notification"], [role="alert"]').allInnerTexts();
    throw new Error('Errores al guardar: ' + texto.join(' | '));
  }
  await expect(page.getByText('Sin guardar')).toBeHidden({ timeout: 30_000 });
  await expect(page.getByText(new RegExp(nombre)).first()).toBeVisible();
  await page.screenshot({ path: 'test-results/prospecto-creado.png' });
});
