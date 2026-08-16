import * as React from "react"
import { cn } from "@/lib/utils"

export interface HatchDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
}

/**
 * HatchDivider - Etched separator with cross-hatch pattern
 *
 * Replaces standard separators with artisanal hatched lines.
 * Creates the appearance of engraved or etched divisions.
 *
 * @param orientation - horizontal (default) or vertical
 */
export function HatchDivider({
  className,
  orientation = "horizontal",
  ...props
}: HatchDividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "shrink-0",
        orientation === "horizontal"
          ? "h-[2px] w-full separator-hatched"
          : "h-full w-[2px] separator-hatched-vertical",
        className
      )}
      {...props}
    />
  )
}

/**
 * HatchDividerWithLabel - Divider with centered label
 */
export function HatchDividerWithLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("relative", className)}>
      <HatchDivider />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="bg-paper-100 px-2 text-xs text-hatch-600 font-semibold">
          {children}
        </span>
      </div>
    </div>
  )
}
