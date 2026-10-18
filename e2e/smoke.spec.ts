import { test, expect } from '@playwright/test'

test('首页可打开', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('栖见').first()).toBeVisible()
})

test('星图路由可打开', async ({ page }) => {
  await page.goto('/galaxy')
  await expect(page.getByText(/决策星图|SPATIAL/i).first()).toBeVisible({ timeout: 15000 })
})
