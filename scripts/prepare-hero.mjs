/**
 * Download hero source and emit responsive WebP + tiny LQIP into public/hero/.
 * Run: node scripts/prepare-hero.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'public', 'hero')
const SRC =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2400&q=90'

fs.mkdirSync(outDir, { recursive: true })

console.log('[prepare-hero] fetching…')
const res = await fetch(SRC)
if (!res.ok) throw new Error(`fetch failed: ${res.status}`)
const buf = Buffer.from(await res.arrayBuffer())
const srcPath = path.join(outDir, 'source.jpg')
fs.writeFileSync(srcPath, buf)
console.log(`[prepare-hero] source ${Math.round(buf.length / 1024)}KB`)

const widths = [640, 960, 1280, 1920]
for (const w of widths) {
  const out = path.join(outDir, `hero-${w}.webp`)
  await sharp(buf)
    .resize({ width: w, withoutEnlargement: true })
    .webp({ quality: 78, effort: 5 })
    .toFile(out)
  console.log(`  hero-${w}.webp ${Math.round(fs.statSync(out).size / 1024)}KB`)
}

const lqip = path.join(outDir, 'hero-lqip.webp')
await sharp(buf)
  .resize({ width: 24 })
  .blur(1.2)
  .webp({ quality: 40 })
  .toFile(lqip)
console.log(`  hero-lqip.webp ${fs.statSync(lqip).size}B`)

// Keep source out of git-friendly public if large — delete after processing
fs.unlinkSync(srcPath)
console.log('[prepare-hero] done → public/hero/')
