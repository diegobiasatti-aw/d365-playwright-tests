# D365 Playwright tests

Pruebas para Dynamics 365 (usar solo el sandbox/UAT).

## Tests disponibles
| Test | Qué hace |
|------|----------|
| `tests/prospecto.spec.ts` | Alta de un Prospecto (Persona Humana) con todos los campos obligatorios, incluida la consulta a Nosis. |

## Uso local
1. Instalar Node 20+ y correr `npm install` y `npx playwright install chromium`.
   (En esta PC Node es portable: agregar `%USERPROFILE%\node-portable\node-v22.11.0-win-x64` al PATH y usar `npm.cmd` / `npx.cmd`.)
2. Copiar `.env.example` a `.env` y completar:
   - `D365_URL`, `D365_APP_ID`
   - `D365_TEST_DNI`: DNI de prueba para el alta de prospecto.
3. `npx playwright test --project=setup --headed` — iniciar sesión manualmente (soporta MFA); se guarda en `.auth/state.json`. Repetir cuando la sesión venza.
4. Correr tests:
   - Alta de prospecto: `npx playwright test prospecto`
   - Verlo en vivo y lento: `$env:SLOWMO="300"; npx playwright test prospecto --headed`
   - Todo: `npm test` y `npm run report`

## Alta de prospecto: notas
- La consulta a Nosis es real. Usar siempre un DNI de prueba (nunca uno al azar: puede traer datos de personas reales).
- Nombre y Apellido los completa Nosis; no se pueden escribir.
- Localidad, teléfono (10 dígitos) y email se completan con datos de prueba.
- Las capturas en `test-results/` pueden contener datos reales: no se suben (están en `.gitignore`).

## Alta de prospecto por API
Endpoint: `POST /crm/altaprospecto` (URL en `API_ALTA_PROSPECTO_URL`, clave en `API_SUBSCRIPTION_KEY`, enviada en el header `Ocp-Apim-Subscription-Key`). Test: `tests/altaprospecto.api.spec.ts`.

Correr: `npx.cmd playwright test --project=api` (no necesita login de D365).

Cómo decide la API según el número de documento:
1. Si el DNI existe como **contacto**, actualiza el contacto.
2. Si no, verifica si existe como **prospecto**:
   - si existe, actualiza el prospecto;
   - si no existe, **crea** el prospecto.

Respuestas observadas: `200` con "Creación Exitosa de Prospecto" (alta) o "Prospecto actualizado correctamente" (actualización). Sin clave devuelve `401`.
Para probar la creación, el DNI no debe existir antes como contacto ni prospecto en QA (hay que eliminarlo).

## CI (GitHub Actions)
Secrets del repo: `D365_URL`, `D365_APP_ID` y `D365_STORAGE_STATE` (contenido JSON de `.auth/state.json`).
Para el prospecto en CI agregar también `D365_TEST_DNI` y pasarlo como variable de entorno en el workflow.
La sesión expira; renovarla periódicamente o usar una cuenta de servicio.

## Cómo pedírselo al agente
> "Corré el test de alta de prospecto del repo d365-playwright-tests con el DNI 12345678 (en modo visible)"

> Repo público: nunca subir `.env`, `.auth/` ni URLs/datos del cliente.
