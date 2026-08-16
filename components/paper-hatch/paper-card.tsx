import * as React from "react"
import { cn } from "@/lib/utils"

export interface PaperCardProps extends React.HTMLAttributes<HTMLDivElement> {
  withHatch?: boolean
}

/**
 * PaperCard - Artisanal card component with paper grain and optional cross-hatch
 *
 * Features:
 * - Paper grain texture overlay
 * - Optional cross-hatch pattern
 * - Soft lift shadow for depth
 * - Warm paper-1 background
 */
export function PaperCard({
  className,
  children,
  withHatch = true,
  ...props
}: PaperCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-[var(--radius)] bg-paper-200 border-2 border-hatch-600 soft-lift overflow-hidden",
        withHatch && "hatch",
        className
      )}
      {...props}
    >
      {/* Paper grain overlay */}
      <div className="absolute inset-0 paper-grain pointer-events-none" />

      {/* Content with proper z-index */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

/**
 * PaperCardHeader - Header section for PaperCard
 */
export function PaperCardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
}

/**
 * PaperCardTitle - Title for PaperCard
 */
export function PaperCardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-serif text-2xl font-semibold leading-none tracking-tight text-ink-700",
        className
      )}
      {...props}
    />
  )
}

/**
 * PaperCardDescription - Description for PaperCard
 */
export function PaperCardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-ink-700/80", className)}
      {...props}
    />
  )
}

/**
 * PaperCardContent - Main content area for PaperCard
 */
export function PaperCardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />
}

/**
 * PaperCardFooter - Footer section for PaperCard
 */
export function PaperCardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
}
