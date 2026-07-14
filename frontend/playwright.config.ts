/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

export default defineConfig
({
  testDir: './e2e',
  fullyParallel: true,
  globalSetup: './e2e/global-setup.ts',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use:
  {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'],
          launchOptions:
          {
            firefoxUserPrefs:
            {
              'browser.sessionstore.resume_from_crash': false,
              'browser.sessionstore.max_tabs_undo': 0,
            },
        },
       },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
     },
  ],
  webServer:
  [
    {
      command: 'cd ../backend && npm run dev',
      url: 'http://localhost:8080/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'npx ng serve --port 4200',
      url: 'http://localhost:4200',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
  ]
});
