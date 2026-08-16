"use client"

import * as React from "react"
import { Plus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AddLabelDialog } from "@/app/mail/components/add-label-dialog"

interface LabelBadgesProps {
  labels: string[]
  mailId: string
  onAddLabel: (label: string) => void
  onRemoveLabel: (label: string) => void
  className?: string
}

export function LabelBadges({
  labels,
  mailId,
  onAddLabel,
  onRemoveLabel,
  className,
}: LabelBadgesProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [removingLabel, setRemovingLabel] = React.useState<string | null>(null)

  const handleRemove = (label: string, e: React.MouseEvent) => {
    e.stopPropagation()

    // Trigger animation
    setRemovingLabel(label)
    setTimeout(() => {
      onRemoveLabel(label)
      setRemovingLabel(null)
    }, 150) // Short animation before removing
  }

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {labels.length > 0 && (
        <>
          {labels.map((label) => (
            <Badge
              key={label}
              variant="secondary"
              className={cn(
                "gap-1 pr-1 transition-all group hover:bg-accent/80",
                removingLabel === label && "animate-out fade-out scale-95 duration-150"
              )}
            >
              <span className="text-xs font-medium">{label}</span>
              <button
                onClick={(e) => handleRemove(label, e)}
                className="ml-0.5 hover:bg-background/50 rounded-full p-0.5 transition-colors opacity-70 group-hover:opacity-100"
                aria-label={`Remove ${label} label`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </>
      )}

      {/* Add label button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Plus className="h-3 w-3 mr-1" />
        Add label
      </Button>

      {/* Label dialog */}
      <AddLabelDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mailId={mailId}
        onAddLabel={onAddLabel}
        onRemoveLabel={onRemoveLabel}
      />
    </div>
  )
}
