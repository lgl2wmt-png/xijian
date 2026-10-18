/**
 * Auto-build a 9:16 ~25s promo video for 栖见.
 * Usage: ensure preview is up, then:
 *   node scripts/make-promo-video.mjs
 * Env: BASE_URL=http://127.0.0.1:4173
 */
import { chromium, devices } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const outDir = path.join(root, 'docs', 'promo', 'out')
const framesDir = path.join(outDir, 'frames')
const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173'
const W = 1080
const H = 1920

const scenes = [
  {
    id: '01-hook',
    seconds: 3,
    path: '/',
    title: '一句话，让 AI\n给我开发个 App？',
    wait: 1800,
  },
  {
    id: '02-agent',
    seconds: 5,
    path: '/',
    title: 'AI 打工日常\n自动写码 · 自动修复',
    wait: 1500,
    overlayCode: true,
  },
  {
    id: '03-deploy',
    seconds: 5,
    path: '/cases',
    title: '一键部署上线\n打通全栈闭环',
    wait: 1800,
    badge: 'Vercel · Ready',
  },
  {
    id: '04-pwa',
    seconds: 7,
    path: '/',
    title: '无需上架 App Store\n秒变原生 App',
    wait: 2000,
    badge: 'PWA · Add to Home Screen',
  },
  {
    id: '05-galaxy',
    seconds: 5,
    path: '/galaxy',
    title: '开源家装平台\n栖见 XIJIAN',
    wait: 2800,
  },
]

fs.mkdirSync(framesDir, { recursive: true })

function findFfmpeg() {
  const candidates = [
    path.join(root, 'tools', 'ffmpeg', 'bin', 'ffmpeg.exe'),
    // Prefer portable tools build; node_modules stub may be incomplete on Windows
    path.join(root, 'node_modules', 'ffmpeg-static', 'ffmpeg.exe'),
    'ffmpeg',
  ]
  for (const c of candidates) {
    if (c === 'ffmpeg') return c
    if (fs.existsSync(c)) return c
  }
  return null
}

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
  throw new Error(`服务未就绪：${url}`)
}

function esc(t) {
  return t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

async function makeTitleCard(file, title, badge) {
  const lines = title.split('\n')
  const textSvg = lines
    .map(
      (line, i) =>
        `<text x="540" y="${820 + i * 110}" text-anchor="middle" font-size="72" font-weight="700" fill="#E8ECEF" font-family="Microsoft YaHei, Noto Sans SC, sans-serif" stroke="#0B1016" stroke-width="10" paint-order="stroke">${esc(line)}</text>`,
    )
    .join('')
  const badgeSvg = badge
    ? `<rect x="240" y="1100" width="600" height="64" rx="12" fill="#0B6E6A"/><text x="540" y="1144" text-anchor="middle" font-size="28" fill="#fff" font-family="Microsoft YaHei, sans-serif">${esc(badge)}</text>`
    : ''
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b1016"/>
      <stop offset="55%" stop-color="#15202b"/>
      <stop offset="100%" stop-color="#0b6e6a"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="540" y="280" text-anchor="middle" font-size="48" fill="#0f8a84" font-family="Microsoft YaHei, sans-serif" letter-spacing="8">栖见 · XIJIAN</text>
  ${textSvg}
  ${badgeSvg}
</svg>`
  await sharp(Buffer.from(svg)).png().toFile(file)
}

async function injectCaption(page, title, badge) {
  await page.evaluate(
    ({ title, badge }) => {
      const old = document.getElementById('xijian-promo-cap')
      if (old) old.remove()
      const el = document.createElement('div')
      el.id = 'xijian-promo-cap'
      el.innerHTML = `
        <div style="position:fixed;inset:0;pointer-events:none;z-index:99999;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;padding:0 48px 220px;background:linear-gradient(transparent 45%,rgba(11,16,22,.75) 100%);font-family:system-ui,'Noto Sans SC',sans-serif;">
          ${badge ? `<div style="margin-bottom:20px;padding:10px 22px;border-radius:999px;background:#0B6E6A;color:#fff;font-size:28px;font-weight:600;">${badge}</div>` : ''}
          <div style="color:#E8ECEF;font-size:52px;font-weight:800;line-height:1.35;text-align:center;text-shadow:0 2px 0 #0b1016,0 8px 24px rgba(0,0,0,.55);white-space:pre-line;">${title}</div>
        </div>`
      document.body.appendChild(el)
    },
    { title, badge: badge || '' },
  )
}

console.log(`[promo] base = ${baseURL}`)
await waitForServer(baseURL)

fs.mkdirSync(path.join(outDir, 'raw'), { recursive: true })

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  ...devices['iPhone 14 Pro Max'],
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 2.5,
  recordVideo: { dir: path.join(outDir, 'raw'), size: { width: 430, height: 932 } },
})
const page = await context.newPage()
// Avoid Google Fonts hanging screenshot / paint
await page.route('**/*fonts.googleapis.com/**', (route) => route.abort())
await page.route('**/*fonts.gstatic.com/**', (route) => route.abort())

const clipList = []

for (const scene of scenes) {
  console.log(`→ scene ${scene.id}`)
  await page.goto(`${baseURL}${scene.path}`, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.addStyleTag({
    content: 'html,body,*{font-family:system-ui,"Segoe UI",sans-serif!important}',
  })
  await page.waitForTimeout(scene.wait)

  if (scene.overlayCode) {
    await page.evaluate(() => {
      const pre = document.createElement('pre')
      pre.id = 'xijian-code-fx'
      pre.style.cssText =
        'position:fixed;top:120px;left:24px;right:24px;z-index:99998;max-height:42%;overflow:hidden;padding:16px;border-radius:12px;background:rgba(11,16,22,.88);color:#7dffb3;font-size:13px;line-height:1.45;border:1px solid rgba(15,138,132,.45);pointer-events:none;font-family:ui-monospace,Consolas,monospace;'
      pre.textContent = `// Cursor Agent · auto fix
const headers = new Headers(init?.headers)
headers.set('Content-Type', 'application/json')
export const useMockApi = true
export const api = mockApi  // Vercel ready ✓`
      document.body.appendChild(pre)
    })
  }

  await injectCaption(page, scene.title, scene.badge)
  await page.waitForTimeout(Math.max(800, scene.seconds * 1000 - 400))

  const shot = path.join(framesDir, `${scene.id}.png`)
  await page.screenshot({
    path: shot,
    fullPage: false,
    timeout: 15000,
    animations: 'disabled',
  })
  const frameOut = path.join(framesDir, `${scene.id}-1080.png`)
  await sharp(shot)
    .resize(W, H, { fit: 'cover', position: 'centre' })
    .png()
    .toFile(frameOut)
  clipList.push({ file: frameOut, seconds: scene.seconds })

  const codeFx = await page.$('#xijian-code-fx')
  if (codeFx) await codeFx.evaluate((n) => n.remove())
}

await context.close()
await browser.close()

// Title cards for cyber beats (optional blend — also write stills for 剪映)
await makeTitleCard(path.join(framesDir, 'card-ready.png'), 'Vercel Ready\n一键上线', 'GitHub → Cloud')
await makeTitleCard(path.join(framesDir, 'card-brand.png'), '栖见 XIJIAN\n开源家装旅程', 'MIT · Open Source')

const ffmpeg = findFfmpeg()
const concatPath = path.join(outDir, 'concat.txt')
const lines = clipList.flatMap((c) => [
  `file '${c.file.replace(/\\/g, '/')}'`,
  `duration ${c.seconds}`,
])
// last frame needs to be repeated for concat demuxer
lines.push(`file '${clipList[clipList.length - 1].file.replace(/\\/g, '/')}'`)
fs.writeFileSync(concatPath, lines.join('\n'), 'utf8')

const mp4 = path.join(outDir, 'xijian-promo-25s.mp4')
const webmRaw = fs.existsSync(path.join(outDir, 'raw'))
  ? fs.readdirSync(path.join(outDir, 'raw')).find((f) => f.endsWith('.webm'))
  : null

if (ffmpeg) {
  console.log(`[promo] ffmpeg = ${ffmpeg}`)
  const r = spawnSync(
    ffmpeg,
    [
      '-y',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      concatPath,
      '-vf',
      'fps=30,format=yuv420p',
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      mp4,
    ],
    { encoding: 'utf8' },
  )
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout)
    throw new Error('ffmpeg concat failed')
  }
  console.log(`[promo] wrote ${path.relative(root, mp4)}`)
} else {
  console.warn('[promo] ffmpeg not found — frames ready for CapCut import')
}

if (webmRaw) {
  console.log(`[promo] raw capture: docs/promo/out/raw/${webmRaw}`)
}

const readme = path.join(outDir, 'README.md')
fs.writeFileSync(
  readme,
  `# 自动成片输出

- \`xijian-promo-25s.mp4\` — 竖屏约 25s（截图卡点拼接，可直接发抖音试看）
- \`frames/\` — 各镜 1080×1920 静帧，可拖进剪映精剪
- \`raw/\` — Playwright 原生长录 webm（可选）

建议：成片加赛博 BGM，卡点落在 0/3/8/13/20 秒。真机「添加到主屏幕」片段可替换第 4 镜。
`,
  'utf8',
)

console.log('[promo] done')
