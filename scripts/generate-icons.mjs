// Generates branded icon assets for the extension.
// Run with: node scripts/generate-icons.mjs
import sharp from "sharp"
import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const assetsDir = join(__dirname, "..", "assets")

const SVG = `
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#4338ca"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28" fill="url(#g)"/>
  <path d="M40 38 H88 M64 38 V92" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M48 78 L80 78" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity="0.6"/>
</svg>
`

const sizes = [16, 32, 48, 64, 128]

await mkdir(assetsDir, { recursive: true })

for (const size of sizes) {
  await sharp(Buffer.from(SVG))
    .resize(size, size)
    .png()
    .toFile(join(assetsDir, `icon${size}.png`))
}

// Also write a default icon.png (128)
await sharp(Buffer.from(SVG))
  .resize(128, 128)
  .png()
  .toFile(join(assetsDir, "icon.png"))

console.log("Icons generated in", assetsDir)
