"use client"

import * as React from "react"
import { Tag, ChevronDown, ChevronRight } from "lucide-react"
import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getAllLabelsWithCounts } from "@/app/mail/utils/label-utils"
import type { Mail } from "@/app/mail/data"

interface LabelNavProps {
  isCollapsed: boolean
  mails: Mail[]
  className?: string
}

interface DroppableLabelItemProps {
  label: string
  count: number
}

function DroppableLabelItem({ label, count }: DroppableLabelItemProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: label,
  })

  return (
    <button
      ref={setNodeRef}
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "justify-start group/label transition-all",
        isOver && "bg-accent border-2 border-primary shadow-sm"
      )}
    >
      <Tag className="mr-2 h-4 w-4 text-muted-foreground group-hover/label:text-foreground transition-colors" />
      <span className="truncate">{label}</span>
      <span className="ml-auto text-muted-foreground text-xs">
        {count}
      </span>
    </button>
  )
}

export function LabelNav({ isCollapsed, mails, className }: LabelNavProps) {
  const [isExpanded, setIsExpanded] = React.useState(true)
  const labelsWithCounts = getAllLabelsWithCounts(mails)

  if (isCollapsed) {
    return (
      <div
        data-collapsed={isCollapsed}
        className={cn("group flex flex-col gap-4 py-2", className)}
      >
        <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "h-9 w-9"
                )}
              >
                <Tag className="h-4 w-4" />
                <span className="sr-only">Labels</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="flex items-center gap-4">
              Labels
              <span className="ml-auto text-muted-foreground">
                {labelsWithCounts.length}
              </span>
            </TooltipContent>
          </Tooltip>
        </nav>
      </div>
    )
  }

  return (
    <div
      data-collapsed={isCollapsed}
      className={cn("group flex flex-col gap-2 py-2", className)}
    >
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-4 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        <span>LABELS</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {labelsWithCounts.length}
        </span>
      </button>

      {/* Label List */}
      {isExpanded && (
        <nav className="grid gap-1 px-2">
          {labelsWithCounts.length === 0 ? (
            <div className="px-2 py-2 text-xs text-muted-foreground text-center">
              No labels yet
            </div>
          ) : (
            labelsWithCounts.map(({ label, count }) => (
              <DroppableLabelItem key={label} label={label} count={count} />
            ))
          )}
        </nav>
      )}
    </div>
  )
}
