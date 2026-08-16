import * as React from "react"
import { cn } from "@/lib/utils"

export interface EtchedWindowProps extends React.HTMLAttributes<HTMLDivElement> {
  withMuntins?: boolean
  muntinRows?: number
  muntinCols?: number
}

/**
 * EtchedWindow - Hero panel with window pane aesthetic
 *
 * Features:
 * - Cross-hatched background
 * - Paper grain texture
 * - Optional muntins (window dividers)
 * - Rounded corners (20px for prominence)
 *
 * Perfect for hero sections, featured content, or preview areas.
 *
 * @param withMuntins - Add window-pane dividers (default: false)
 * @param muntinRows - Number of rows (default: 3)
 * @param muntinCols - Number of columns (default: 3)
 */
export function EtchedWindow({
  className,
  children,
  withMuntins = false,
  muntinRows = 3,
  muntinCols = 3,
  ...props
}: EtchedWindowProps) {
  return (
    <div
      className={cn(
        "relative rounded-[20px] bg-paper-200 border-2 border-hatch-600 overflow-hidden hatch",
        className
      )}
      {...props}
    >
      {/* Paper grain overlay */}
      <div className="absolute inset-0 paper-grain pointer-events-none z-10" />

      {/* Optional muntins (window pane dividers) */}
      {withMuntins && (
        <div
          className="absolute inset-3 opacity-40 pointer-events-none z-20"
          style={{
            display: "grid",
            gridTemplateRows: `repeat(${muntinRows}, 1fr)`,
            gridTemplateColumns: `repeat(${muntinCols}, 1fr)`,
            gap: "12px",
          }}
        >
          {Array.from({ length: muntinRows * muntinCols }).map((_, i) => (
            <div
              key={i}
              className="border border-hatch-600/60 rounded-sm"
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-30">{children}</div>
    </div>
  )
}

/**
 * EtchedWindowHeader - Header for window
 */
export function EtchedWindowHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-6 py-4 border-b-2 border-hatch-600",
        className
      )}
      {...props}
    />
  )
}

/**
 * EtchedWindowContent - Main content area
 */
export function EtchedWindowContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-6", className)}
      {...props}
    />
  )
}
