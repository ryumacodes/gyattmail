"use client"

import * as React from "react"
import { Check, Plus, X, Search, Clock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useMailData } from "@/app/mail/use-mail-data"
import { useLabelHistory } from "@/app/mail/hooks/use-label-history"
import { cn } from "@/lib/utils"

interface AddLabelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mailId: string
  onAddLabel: (label: string) => void
  onRemoveLabel: (label: string) => void
}

export function AddLabelDialog({
  open,
  onOpenChange,
  mailId,
  onAddLabel,
  onRemoveLabel,
}: AddLabelDialogProps) {
  const [mails] = useMailData()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [newLabelInput, setNewLabelInput] = React.useState("")
  const { getRecentLabels, addToHistory } = useLabelHistory()

  const currentMail = mails.find(m => m.id === mailId)
  const currentLabels = currentMail?.labels || []

  // Get all unique labels from all mails with counts
  const allLabelsWithCounts = React.useMemo(() => {
    const labelCounts = new Map<string, number>()
    mails.forEach(mail => {
      mail.labels.forEach(label => {
        labelCounts.set(label, (labelCounts.get(label) || 0) + 1)
      })
    })
    return Array.from(labelCounts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [mails])

  // Get recent labels (excluding already applied ones)
  const recentLabels = React.useMemo(() => {
    return getRecentLabels(5).filter(label => !currentLabels.includes(label))
  }, [getRecentLabels, currentLabels])

  // Filter labels based on search query
  const filteredLabels = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return allLabelsWithCounts
    }
    const query = searchQuery.toLowerCase()
    return allLabelsWithCounts.filter(({ label }) =>
      label.toLowerCase().includes(query)
    )
  }, [allLabelsWithCounts, searchQuery])

  const handleAddNewLabel = () => {
    const trimmed = newLabelInput.trim().toLowerCase()
    if (trimmed && !currentLabels.includes(trimmed)) {
      onAddLabel(trimmed)
      addToHistory(trimmed)
      setNewLabelInput("")
      setSearchQuery("")
    }
  }

  const handleToggleLabel = (label: string) => {
    if (currentLabels.includes(label)) {
      onRemoveLabel(label)
    } else {
      onAddLabel(label)
      addToHistory(label)
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      // If there's an exact match, toggle it
      const exactMatch = filteredLabels.find(
        ({ label }) => label.toLowerCase() === searchQuery.toLowerCase()
      )
      if (exactMatch) {
        handleToggleLabel(exactMatch.label)
        setSearchQuery("")
      } else {
        // Create new label
        const trimmed = searchQuery.trim().toLowerCase()
        if (!currentLabels.includes(trimmed)) {
          onAddLabel(trimmed)
          addToHistory(trimmed)
          setSearchQuery("")
        }
      }
    }
  }

  // Reset search when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSearchQuery("")
      setNewLabelInput("")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] paper-grain border-2">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif font-bold">
            Manage Labels
          </DialogTitle>
          <DialogDescription className="text-sm">
            Add or remove labels for this email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search or create label..."
              className="pl-9"
              autoFocus
            />
          </div>

          {/* Current labels */}
          {currentLabels.length > 0 && (
            <>
              <div>
                <p className="text-sm font-medium mb-2">Applied labels:</p>
                <div className="flex flex-wrap gap-2">
                  {currentLabels.map(label => (
                    <Badge
                      key={label}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      {label}
                      <button
                        onClick={() => onRemoveLabel(label)}
                        className="ml-1 hover:bg-background/50 rounded-full p-0.5 transition-colors"
                        aria-label={`Remove ${label}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Recent labels */}
          {recentLabels.length > 0 && !searchQuery && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Recent:</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentLabels.map(label => {
                  const isActive = currentLabels.includes(label)
                  const labelData = allLabelsWithCounts.find(l => l.label === label)
                  return (
                    <button
                      key={label}
                      onClick={() => handleToggleLabel(label)}
                      className={cn(
                        "inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium",
                        "border-2 transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:bg-accent hover:border-accent-foreground"
                      )}
                    >
                      {isActive && <Check className="h-3 w-3" />}
                      {label}
                      {labelData && (
                        <span className="text-[10px] opacity-60">
                          ({labelData.count})
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* All labels (filtered) */}
          {filteredLabels.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">
                {searchQuery ? "Search results:" : "All labels:"}
              </p>
              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                {filteredLabels.map(({ label, count }) => {
                  const isActive = currentLabels.includes(label)
                  return (
                    <button
                      key={label}
                      onClick={() => handleToggleLabel(label)}
                      className={cn(
                        "inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium",
                        "border-2 transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:bg-accent hover:border-accent-foreground"
                      )}
                    >
                      {isActive && <Check className="h-3 w-3" />}
                      {label}
                      <span className="text-[10px] opacity-60">
                        ({count})
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* No results / Create new */}
          {searchQuery && filteredLabels.length === 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-3">
                No labels found for "{searchQuery}"
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const trimmed = searchQuery.trim().toLowerCase()
                  if (!currentLabels.includes(trimmed)) {
                    onAddLabel(trimmed)
                    addToHistory(trimmed)
                    setSearchQuery("")
                  }
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Create "{searchQuery}"
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
