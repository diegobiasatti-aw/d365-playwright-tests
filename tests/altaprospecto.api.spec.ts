import { test, expect } from '@playwright/test';

const url = process.env.API_ALTA_PROSPECTO_URL;
const key = process.env.API_SUBSCRIPTION_KEY;

const body = {
  nombre: 'LEANDRO FABIAN',
  apellido: 'DOMINGUEZ',
  tipoDocumento: 121020000,
  numeroDocumento: Number(process.env.D365_TEST_DNI),
  tipoTelefono: 121020001,
  telefono: 111111110,
  email: 'qa.prueba@example.com',
  localidad: 416,
  origen: 1018,
  genero: 121020001,
};

test.describe('API altaprospecto', () => {
  test.skip(!url || !key, 'Definí API_ALTA_PROSPECTO_URL y API_SUBSCRIPTION_KEY en .env');

  test('sin clave de suscripción devuelve 401', async ({ request }) => {
    const res = await request.post(url!, { data: body });
    expect(res.status()).toBe(401);
  });

  test('alta de prospecto con body válido', async ({ request }) => {
    const res = await request.post(url!, {
      headers: { 'Ocp-Apim-Subscription-Key': key! },
      data: body,
    });
    console.log('status', res.status(), await res.text());
    expect(res.ok()).toBeTruthy();
  });
});
