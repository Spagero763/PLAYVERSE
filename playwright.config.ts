import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  use: {
    headless: true,
    baseURL: process.env.PREVIEW_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  // Web server config and projects removed for MVP
  // Recreate webServer and projects when re-enabling Playwright tests.
  projects: [],
});
