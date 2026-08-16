/**
 * Paper Texture Generator
 *
 * Generates a subtle paper grain texture using Canvas API.
 * Run with: node --loader ts-node/esm scripts/generate-paper-texture.ts
 *
 * Output: public/textures/paper-noise.webp (240x240px, ~8-12KB)
 */

import { createCanvas } from "canvas"
import fs from "fs"
import path from "path"

const SIZE = 240
const NOISE_INTENSITY = 0.15 // Subtle grain

function generatePaperTexture(): Buffer {
  const canvas = createCanvas(SIZE, SIZE)
  const ctx = canvas.getContext("2d")

  // Base paper color (paper0)
  ctx.fillStyle = "#F4EFE4"
  ctx.fillRect(0, 0, SIZE, SIZE)

  // Add noise
  const imageData = ctx.getImageData(0, 0, SIZE, SIZE)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    // Random noise value
    const noise = (Math.random() - 0.5) * NOISE_INTENSITY * 255

    // Apply to RGB channels (not alpha)
    data[i] += noise     // R
    data[i + 1] += noise // G
    data[i + 2] += noise // B
    // data[i + 3] stays at 255 (fully opaque)
  }

  ctx.putImageData(imageData, 0, 0)

  // Convert to WebP
  return canvas.toBuffer("image/webp", { quality: 0.8 })
}

// Create textures directory if it doesn't exist
const texturesDir = path.join(process.cwd(), "public", "textures")
if (!fs.existsSync(texturesDir)) {
  fs.mkdirSync(texturesDir, { recursive: true })
}

// Generate and save texture
const texture = generatePaperTexture()
const outputPath = path.join(texturesDir, "paper-noise.webp")
fs.writeFileSync(outputPath, texture)

console.log(`✅ Paper texture generated: ${outputPath}`)
console.log(`   Size: ${(texture.length / 1024).toFixed(2)} KB`)
