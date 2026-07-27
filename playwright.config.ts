import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  // The scroll-world flight adds several viewports of scroll ahead of the rest of the
  // page, and every worker now runs a WebGL context, so scroll-driven specs need more
  // than the 30s default.
  timeout: 60_000,
  // Headless Chromium falls back to software GL, where several concurrent WebGL
  // contexts uploading full-screen textures starve each other badly enough to time
  // tests out. Capping workers keeps the suite deterministic; it is a harness limit,
  // not a limit of the page itself, which holds 60fps in a real GPU-backed browser.
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['line'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
