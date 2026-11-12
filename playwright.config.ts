import { defineConfig } from '@playwright/test';
import 'dotenv/config';

export const STORAGE_STATE = '.auth/state.json';

export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  expect: { timeout: 30_000 },
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.D365_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: { slowMo: Number(process.env.SLOWMO ?? 0) },
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'smoke',
      testMatch: /.*\.spec\.ts/,
      dependencies: ['setup'],
      use: { storageState: STORAGE_STATE },
    },
  ],
});
