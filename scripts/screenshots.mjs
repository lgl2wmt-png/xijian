/**
 * 自动截取核心页面 → docs/screenshots/
 * 用法：先 npm run dev，再 npm run screenshots
 * 或：BASE_URL=http://localhost:5173 npm run screenshots
 */
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const outDir = path.join(root, 'docs', 'screenshots')
const baseURL = process.env.BASE_URL || 'http://127.0.0.1:5173'

const shots = [
  { name: 'home', path: '/', wait: 2000, fullPage: false },
  { name: 'galaxy', path: '/galaxy', wait: 2800, fullPage: false },
  { name: 'cases', path: '/cases', wait: 2000, fullPage: false },
  { name: 'designers', path: '/designers', wait: 2000, fullPage: false },
  { name: 'progress', path: '/progress', wait: 2000, fullPage: false },
  { name: 'hud', path: '/hud', wait: 3500, fullPage: false },
  { name: 'sandbox', path: '/sandbox', wait: 2800, fullPage: false },
]

fs.mkdirSync(outDir, { recursive: true })

async function waitForServer(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url)
      if (res.ok || res.status === 404) return
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`服务未就绪：${url}（请先 npm run dev）`)
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
})

console.log(`[screenshots] base = ${baseURL}`)
await waitForServer(baseURL)

for (const shot of shots) {
  const url = `${baseURL}${shot.path}`
  console.log(`→ ${shot.name} ${url}`)
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(shot.wait)
  const ok =
    (await page.locator('text=栖见').count()) +
      (await page.locator('text=PROJECT_ID').count()) +
      (await page.locator('text=PIXEL TWIN').count()) +
      (await page.locator('text=SPATIAL GRAPH').count()) >
    0
  if (!ok) {
    throw new Error(`未识别为栖见页面，请检查 BASE_URL。当前：${url}`)
  }
  const png = path.join(outDir, `${shot.name}.png`)
  const webp = path.join(outDir, `${shot.name}.webp`)
  await page.screenshot({ path: png, fullPage: shot.fullPage })
  await sharp(png).webp({ quality: 82 }).toFile(webp)
  fs.unlinkSync(png)
  console.log(`  saved ${path.relative(root, webp)}`)
}

await browser.close()
console.log('[screenshots] done → docs/screenshots/*.webp')
