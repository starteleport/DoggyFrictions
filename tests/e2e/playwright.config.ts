import { defineConfig, devices } from '@playwright/test';

// The app must already be running: `docker compose up -d --build` serves it on :5190.
// Keep the host `localhost` (or use https): the PWA tests need a secure context for the service worker.
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:5190';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['github'], ['list'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    // The app follows the browser's language until one is picked in its settings menu.
    locale: 'ru-RU',
    screenshot: 'on',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    // SLOWMO=300 slows every action down so a headed run can be followed by eye.
    launchOptions: { slowMo: Number(process.env.SLOWMO ?? 0) },
  },
  projects: [
    {
      name: 'desktop',
      testIgnore: /mobile\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } },
    },
    {
      // A phone viewport: the pages are responsive and lay table rows out as cards here.
      name: 'mobile',
      testMatch: /mobile\.spec\.ts/,
      use: { ...devices['Pixel 7'] },
    },
  ],
});
