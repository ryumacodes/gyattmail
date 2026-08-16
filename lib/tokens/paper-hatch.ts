/**
 * Paper-Hatch Design System Tokens
 *
 * Mood: winter-quiet, engraved, tactile
 * Technique: paper grain + cross-hatching + imperfect ink lines
 * Primary color: hat brown (gnome cap from reference image)
 * Foundation: warm paper beige
 * Ink: warm charcoal (not pure black)
 */

export const PaperHatch = {
  // Paper surfaces
  paper0: "#F4EFE4",  // page bg (paper)
  paper1: "#E8DDC9",  // panels, cursorline, floats

  // Ink colors (warm charcoal, not pure black)
  ink9: "#1F1B17",    // main text (warm charcoal)
  ink7: "#4D4136",    // headings, strong, line numbers

  // Hatch/etching colors
  hatch6: "#7A6857",  // etched lines, comments, dividers

  // Primary accent (hat brown from gnome)
  hat6: "#B7662E",    // PRIMARY accent (buttons, search, focus)
  hat7: "#8E4E22",    // active/darker accent
  hat4: "#E3A46E",    // light accent (hover, subtle tags)

  // Semantic colors
  pine5: "#2D5A4E",   // success
  berry5: "#7C3A2F",  // error/destructive
} as const;

export type PaperHatchColor = keyof typeof PaperHatch;

// Helper to get color with opacity
export function withOpacity(color: string, opacity: number): string {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
}

// Semantic mappings for easy reference
export const Semantic = {
  background: PaperHatch.paper0,
  surface: PaperHatch.paper1,
  text: PaperHatch.ink9,
  textMuted: PaperHatch.ink7,
  border: PaperHatch.hatch6,
  primary: PaperHatch.hat6,
  primaryHover: PaperHatch.hat4,
  primaryActive: PaperHatch.hat7,
  success: PaperHatch.pine5,
  error: PaperHatch.berry5,
} as const;
