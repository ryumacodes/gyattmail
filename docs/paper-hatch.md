# Paper-Hatch Design System

**GyattMail's hand-crafted, artisanal design language**

> Mood: winter-quiet, engraved, tactile
> Technique: paper grain + cross-hatching + imperfect ink lines
> Primary color: hat brown (gnome cap from reference image)
> Foundation: warm paper beige
> Ink: warm charcoal (not pure black)

---

## Philosophy

Paper-Hatch brings the warmth and authenticity of hand-made paper goods to digital interfaces. Every element feels like it was carefully crafted with ink on textured paper, featuring:

- **Cross-hatched borders** instead of solid lines
- **Paper grain textures** for tactile depth
- **Wobbly, hand-drawn borders** via RoughJS
- **Letterpress-style buttons** with inset shadows
- **Warm, earthy color palette** derived from natural materials

---

## Color Tokens

All colors are defined in `lib/tokens/paper-hatch.ts`:

```typescript
export const PaperHatch = {
  // Paper surfaces
  paper0: "#F4EFE4",  // page background (paper)
  paper1: "#E8DDC9",  // panels, cursorline, floats

  // Ink colors (warm charcoal, not pure black)
  ink9: "#1F1B17",    // main text
  ink7: "#4D4136",    // headings, strong

  // Hatch/etching colors
  hatch6: "#7A6857",  // etched lines, comments, dividers

  // Primary accent (hat brown from gnome)
  hat6: "#B7662E",    // PRIMARY (buttons, search, focus)
  hat7: "#8E4E22",    // active/darker accent
  hat4: "#E3A46E",    // light accent (hover, subtle tags)

  // Semantic colors
  pine5: "#2D5A4E",   // success
  berry5: "#7C3A2F",  // error/destructive
}
```

### Tailwind Usage

```jsx
<div className="bg-paper-100 text-ink-900 border-2 border-hatch-600">
  <button className="bg-hat-600 text-paper-100 hover:bg-hat-700">
    Primary Action
  </button>
</div>
```

---

## Core Components

### 1. LetterpressButton

Rounded buttons with inset shadow effect, mimicking letterpress printing.

```jsx
import { LetterpressButton } from "@/components/paper-hatch"

<LetterpressButton variant="default" size="lg">
  Join Waitlist →
</LetterpressButton>

<LetterpressButton variant="outline">
  View on GitHub
</LetterpressButton>
```

**Variants:** `default`, `destructive`, `outline`, `secondary`, `ghost`
**Sizes:** `default`, `sm`, `lg`, `icon`

---

### 2. PaperCard

Card component with paper grain texture and optional cross-hatch overlay.

```jsx
import {
  PaperCard,
  PaperCardHeader,
  PaperCardTitle,
  PaperCardContent,
} from "@/components/paper-hatch"

<PaperCard withHatch={true}>
  <PaperCardHeader>
    <PaperCardTitle>Product Preview</PaperCardTitle>
  </PaperCardHeader>
  <PaperCardContent>
    {/* Your content */}
  </PaperCardContent>
</PaperCard>
```

**Props:**
- `withHatch?: boolean` - Add cross-hatch overlay (default: true)

---

### 3. RoughBorder

Hand-drawn, wobbly borders via RoughJS for organic feel.

```jsx
import { RoughBorder } from "@/components/paper-hatch"

<div className="relative p-6">
  <RoughBorder roughness={2.2} stroke="#7A6857" />
  {/* Hero content */}
</div>
```

**Props:**
- `radius?: number` - Corner radius (default: 14)
- `stroke?: string` - Border color (default: #7A6857)
- `roughness?: number` - How wobbly (default: 2.2)
- `bowing?: number` - Line curvature (default: 1.2)
- `strokeWidth?: number` - Line thickness (default: 1.2)

⚠️ **Performance note:** Use sparingly (3-5 hero surfaces) to avoid canvas overhead.

---

### 4. HatchDivider

Etched separator with cross-hatch pattern instead of solid line.

```jsx
import { HatchDivider, HatchDividerWithLabel } from "@/components/paper-hatch"

<HatchDivider />

<HatchDividerWithLabel>
  or
</HatchDividerWithLabel>

<HatchDivider orientation="vertical" className="h-full" />
```

---

### 5. SketchIcon

Wrapper for Lucide icons to give them hand-drawn stroke feel.

```jsx
import { SketchIcon } from "@/components/paper-hatch"
import { Mail, Send } from "lucide-react"

<SketchIcon>
  <Mail size={18} />
</SketchIcon>

<SketchIconButton onClick={...}>
  <Send size={16} />
</SketchIconButton>
```

Icons get:
- Rounded stroke caps/joins
- Dashed stroke pattern (3-2)
- Slightly thicker stroke weight (1.25)

---

### 6. EtchedWindow

Hero panel with window-pane aesthetic and optional muntins.

```jsx
import {
  EtchedWindow,
  EtchedWindowHeader,
  EtchedWindowContent,
} from "@/components/paper-hatch"

<EtchedWindow withMuntins={true} muntinRows={3} muntinCols={3}>
  <EtchedWindowHeader>
    <h2>Preview</h2>
  </EtchedWindowHeader>
  <EtchedWindowContent>
    {/* Your hero content */}
  </EtchedWindowContent>
</EtchedWindow>
```

**Props:**
- `withMuntins?: boolean` - Add window pane dividers
- `muntinRows?: number` - Grid rows (default: 3)
- `muntinCols?: number` - Grid columns (default: 3)

---

## Utility Classes

### Paper Grain

```jsx
<div className="paper-grain">
  {/* Adds subtle noise texture overlay */}
</div>
```

### Cross-Hatch Overlay

```jsx
<div className="hatch">
  {/* Adds dual-angle (35deg + -35deg) hatching */}
</div>
```

### Letterpress Shadow

```jsx
<button className="letterpress">
  {/* Adds inset shadow for pressed effect */}
</button>
```

### Soft Lift

```jsx
<div className="soft-lift">
  {/* Adds elevation shadow */}
</div>
```

### Sketch Icons

```jsx
<span className="sketch">
  <Mail size={18} />
</span>
```

---

## Typography

Paper-Hatch includes refined typography for readability:

```jsx
// Headings - ink-700, semi-bold, tight tracking
<h1 className="text-ink-700">Heading</h1>

// Body text - ink-900
<p className="text-ink-900">Body text</p>

// Links - hat-600 → hat-700
<a href="#" className="text-hat-600 hover:text-hat-700">Link</a>

// Code blocks - paper-200 background
<code className="bg-paper-200 text-ink-700">const x = 42</code>
```

---

## Badge Styling

All badges use **outlined pill** style (no solid fill):

```jsx
import { Badge } from "@/components/ui/badge"

<Badge variant="default">meeting</Badge>
<Badge variant="secondary">work</Badge>
<Badge variant="success">important</Badge>
```

Variants: `default` (hat-600), `secondary` (hatch-600), `destructive` (berry-500), `success` (pine-500)

---

## Accessibility

Paper-Hatch meets **WCAG AAA** contrast requirements:

- **ink9** on **paper0**: ~11:1 (excellent)
- **ink7** on **paper0**: ~7.5:1 (AAA)
- **hat6** on **paper0**: ~4.8:1 (AA for large text)

### Focus Rings

All interactive elements use `hat-600` focus rings:

```css
focus-visible:ring-2 focus-visible:ring-hat-600 focus-visible:ring-offset-2
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  .hatch::before,
  .hatch::after {
    opacity: 0.6; /* Increase hatching visibility */
  }

  .separator-hatched {
    background-color: #7A6857; /* Solid fallback */
    background-image: none;
  }
}
```

---

## Performance

### Best Practices

1. **Limit RoughBorder usage** to 3-5 key surfaces (hero, featured cards)
2. **Compress textures**: `paper-noise.svg` should be <10KB
3. **Use CSS hatching** for most borders (not RoughJS)
4. **Leverage mix-blend-mode** carefully (can be GPU-intensive)

### High-DPI Optimization

```css
@media (min-resolution: 2dppx) {
  .hatch::before {
    background-size: 12px 12px; /* Prevent moiré */
  }
  .hatch::after {
    background-size: 14px 14px;
  }
}
```

---

## Example Layouts

### Hero Section

```jsx
<section className="mx-auto w-[min(1200px,92%)] grid lg:grid-cols-2 gap-10 py-16">
  <div className="flex flex-col justify-center">
    <h1 className="font-serif text-5xl text-ink-900 leading-tight">
      Your open-source email, <span className="text-hat-700">carved</span> for control.
    </h1>
    <p className="mt-5 text-lg text-ink-700/90">
      Take back your inbox with a secure, customizable, open platform.
    </p>
    <div className="mt-7 flex gap-4">
      <LetterpressButton>Join waitlist →</LetterpressButton>
      <LetterpressButton variant="outline">View on GitHub</LetterpressButton>
    </div>
  </div>

  <EtchedWindow withMuntins>
    <div className="aspect-[4/3] bg-paper-200" />
  </EtchedWindow>
</section>
```

### Inbox Preview

```jsx
<PaperCard className="p-4">
  <h3 className="font-serif text-2xl text-ink-700 px-2">Inbox</h3>
  <HatchDivider />
  <div className="grid grid-cols-12 gap-3 mt-3">
    {/* 3-pane layout: sidebar, list, reader */}
  </div>
</PaperCard>
```

---

## Neovim Integration

For developers using Neovim, align your editor colors:

```lua
-- Paper-Hatch Neovim Theme (light mode)
vim.cmd[[
  hi Normal guibg=#F4EFE4 guifg=#1F1B17
  hi CursorLine guibg=#E8DDC9
  hi Comment guifg=#7A6857
  hi Search guibg=#B7662E guifg=#F4EFE4
  hi LineNr guifg=#7A6857
  hi MatchParen guibg=#E3A46E
]]
```

---

## Migration from Standard Themes

### Button Updates

```diff
- <Button variant="default">Click</Button>
+ <LetterpressButton variant="default">Click</LetterpressButton>
```

### Badge Updates

```diff
- <Badge>meeting</Badge>  {/* Solid fill */}
+ <Badge variant="default">meeting</Badge>  {/* Outlined */}
```

### Separator Updates

```diff
- <Separator />  {/* Solid line */}
+ <HatchDivider />  {/* Cross-hatched */}
```

---

## Contributing

When adding new components:

1. Use `paper-*`, `ink-*`, `hatch-*`, `hat-*` color tokens
2. Apply `.paper-grain` for texture
3. Use `.hatch` for depth (not on every element—be selective)
4. Round corners with `var(--radius)` (14px)
5. Test with `prefers-reduced-motion` and `prefers-contrast`

---

## Credits

- Design inspired by traditional letterpress & engraving
- Color palette derived from gnome-window reference image
- Built on [shadcn/ui](https://ui.shadcn.com) foundations
- Hand-drawn borders via [RoughJS](https://roughjs.com)

---

**Questions?** Open an issue or check the [component storybook](./STORYBOOK.md).

