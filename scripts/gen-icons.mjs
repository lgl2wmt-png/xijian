import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const dir = path.join(root, 'public', 'icons')
fs.mkdirSync(dir, { recursive: true })
const svg = fs.readFileSync(path.join(root, 'public', 'favicon.svg'))

for (const size of [192, 512]) {
  const out = path.join(dir, `icon-${size}.png`)
  await sharp(svg).resize(size, size).png().toFile(out)
  console.log(path.basename(out))
}
await sharp(svg).resize(512, 512).png().toFile(path.join(dir, 'maskable-512.png'))
console.log('maskable-512.png')
