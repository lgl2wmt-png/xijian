import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'screenshots')

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.png'))) {
  const inp = path.join(dir, f)
  const out = path.join(dir, f.replace(/\.png$/i, '.webp'))
  await sharp(inp).webp({ quality: 82 }).toFile(out)
  const a = fs.statSync(inp).size
  const b = fs.statSync(out).size
  console.log(`${f}: ${Math.round(a / 1024)}KB → ${path.basename(out)} ${Math.round(b / 1024)}KB`)
}

console.log('[to-webp] done')
