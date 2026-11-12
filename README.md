# D365 Playwright tests

Pruebas de humo para Dynamics 365 (usar un entorno sandbox/UAT).

## Uso local
1. Instalar Node 20+ y correr `npm install` y `npx playwright install chromium`.
2. Copiar `.env.example` a `.env` y completar `D365_URL`.
3. `npm run auth` — iniciar sesión manualmente (soporta MFA); se guarda en `.auth/state.json`.
4. `npm test` y `npm run report`.

## CI (GitHub Actions)
Secrets del repo: `D365_URL`, `D365_APP_ID` (opcional) y `D365_STORAGE_STATE` (contenido JSON de `.auth/state.json`).
La sesión expira; renovarla periódicamente o usar una cuenta de servicio.

> Repo público: nunca subir `.env`, `.auth/` ni URLs/datos del cliente.
