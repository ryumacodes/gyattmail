"use client"

import * as React from "react"
import rough from "roughjs/bundled/rough.esm.js"

export interface RoughBorderProps {
  radius?: number
  stroke?: string
  roughness?: number
  bowing?: number
  strokeWidth?: number
  className?: string
}

/**
 * RoughBorder - Hand-drawn wobbly border via RoughJS
 *
 * Adds organic, imperfect borders to elements for true artisanal feel.
 * Use sparingly (3-5 hero/key surfaces) for performance.
 *
 * @param radius - Corner radius (default: 14)
 * @param stroke - Border color (default: hatch-600)
 * @param roughness - How rough/wobbly the line is (default: 2.2)
 * @param bowing - How much the line bows (default: 1.2)
 * @param strokeWidth - Line thickness (default: 1.2)
 */
export function RoughBorder({
  radius = 14,
  stroke = "#7A6857",
  roughness = 2.2,
  bowing = 1.2,
  strokeWidth = 1.2,
  className,
}: RoughBorderProps) {
  const ref = React.useRef<SVGSVGElement>(null)

  React.useEffect(() => {
    if (!ref.current) return

    const svg = ref.current
    const rc = rough.svg(svg)

    // Get element dimensions
    const rect = svg.parentElement?.getBoundingClientRect()
    if (!rect) return

    const w = rect.width
    const h = rect.height

    // Create rough rectangle
    const node = rc.rectangle(2, 2, w - 4, h - 4, {
      roughness,
      bowing,
      stroke,
      fill: "none",
      strokeWidth,
      curveTightness: 8,
      // Add slight randomness to seed for uniqueness
      seed: Math.floor(Math.random() * 1000),
    })

    // Clear and append
    svg.innerHTML = ""
    svg.appendChild(node)
  }, [radius, stroke, roughness, bowing, strokeWidth])

  return (
    <svg
      ref={ref}
      className={className || "absolute inset-0 pointer-events-none"}
      style={{ width: "100%", height: "100%" }}
      aria-hidden="true"
    />
  )
}

/**
 * RoughCircle - Hand-drawn circle/ellipse
 */
export function RoughCircle({
  stroke = "#7A6857",
  roughness = 2,
  className,
}: Omit<RoughBorderProps, "radius" | "bowing">) {
  const ref = React.useRef<SVGSVGElement>(null)

  React.useEffect(() => {
    if (!ref.current) return

    const svg = ref.current
    const rc = rough.svg(svg)

    const rect = svg.parentElement?.getBoundingClientRect()
    if (!rect) return

    const w = rect.width
    const h = rect.height
    const cx = w / 2
    const cy = h / 2
    const r = Math.min(w, h) / 2 - 4

    const node = rc.circle(cx, cy, r * 2, {
      roughness,
      stroke,
      fill: "none",
      strokeWidth: 1.2,
      seed: Math.floor(Math.random() * 1000),
    })

    svg.innerHTML = ""
    svg.appendChild(node)
  }, [stroke, roughness])

  return (
    <svg
      ref={ref}
      className={className || "absolute inset-0 pointer-events-none"}
      style={{ width: "100%", height: "100%" }}
      aria-hidden="true"
    />
  )
}
