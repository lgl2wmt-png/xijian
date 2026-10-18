import { defineConfig } from '@playwright/test'

/**
 * 可选：用 Playwright Test 跑 e2e。
 * 截图主入口是 scripts/screenshots.mjs（npm run screenshots）。
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:5173',
    viewport: { width: 1440, height: 900 },
    trace: 'off',
  },
  webServer: process.env.SKIP_WEBSERVER
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://127.0.0.1:5173',
        reuseExistingServer: true,
        timeout: 120_000,
      },
})
