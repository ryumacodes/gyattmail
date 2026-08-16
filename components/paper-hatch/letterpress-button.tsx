import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const letterpressButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 letterpress",
  {
    variants: {
      variant: {
        default:
          "bg-hat-600 text-paper-100 hover:brightness-105 active:brightness-95",
        secondary:
          "bg-paper-200 text-ink-700 border-2 border-hatch-600 hover:bg-paper-100",
        outline:
          "border-2 border-hat-600 text-hat-700 bg-transparent hover:bg-hat-400/10",
        ghost:
          "text-ink-700 hover:bg-paper-200 hover:text-ink-900",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-full px-4",
        lg: "h-12 rounded-full px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface LetterpressButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof letterpressButtonVariants> {
  asChild?: boolean
}

const LetterpressButton = React.forwardRef<HTMLButtonElement, LetterpressButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(letterpressButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
LetterpressButton.displayName = "LetterpressButton"

export { LetterpressButton, letterpressButtonVariants }
