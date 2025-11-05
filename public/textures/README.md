# Paper-Hatch Textures

This directory contains texture assets for the Paper-Hatch design system.

## paper-noise.webp

A subtle paper grain texture (240x240px) that adds tactile warmth to surfaces.

- **Usage**: Applied via `.paper-grain` utility class
- **Opacity**: 12% (via CSS)
- **Blend mode**: multiply
- **Size**: ~8-12 KB (optimized WebP)

## Generating Custom Textures

To generate a custom paper texture:

```bash
# Install canvas (one-time)
npm install --save-dev canvas @types/canvas

# Generate texture
npx ts-node scripts/generate-paper-texture.ts
```

## SVG Patterns (Optional)

For browsers that don't support WebP well, you can use SVG patterns:

```svg
<pattern id="paper-hatch" patternUnits="userSpaceOnUse" width="6" height="6">
  <path d="M0,6 L6,0" stroke="#7A6857" stroke-width="0.5" opacity="0.3"/>
</pattern>
```
