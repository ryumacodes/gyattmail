import * as React from "react"
import { cn } from "@/lib/utils"

export interface SketchIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
}

/**
 * SketchIcon - Wrapper for icons with sketchy stroke effect
 *
 * Applies hand-drawn style to Lucide icons:
 * - Rounded stroke caps/joins
 * - Dashed stroke pattern (3-2)
 * - Slightly thicker stroke weight
 *
 * Use around any Lucide icon to give it artisanal feel.
 *
 * @example
 * <SketchIcon><Mail size={18} /></SketchIcon>
 */
export function SketchIcon({
  className,
  children,
  ...props
}: SketchIconProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center sketch text-ink-700",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

/**
 * SketchIconButton - Icon button with sketch style
 */
export function SketchIconButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2",
        "text-ink-700 hover:bg-paper-200 hover:text-ink-900",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "sketch",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
