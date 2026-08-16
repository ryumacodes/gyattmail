"use client"

import * as React from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface QuotedTextCollapseProps {
  quotedSections: Array<{
    content: string
    type: "reply" | "forward" | "quote"
  }>
  className?: string
}

export function QuotedTextCollapse({
  quotedSections,
  className,
}: QuotedTextCollapseProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  if (quotedSections.length === 0) {
    return null
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className={cn("mt-4", className)}>
      {/* Toggle button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleExpanded}
        className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors gap-1"
      >
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        {isExpanded ? "Hide" : "Show"} older{" "}
        {quotedSections.length === 1 ? "reply" : `replies (${quotedSections.length})`}
      </Button>

      {/* Quoted content */}
      {isExpanded && (
        <div className="mt-2 space-y-2">
          {quotedSections.map((section, index) => (
            <div
              key={index}
              className={cn(
                "border-l-4 pl-4 py-2 text-sm",
                section.type === "forward"
                  ? "border-primary/40 bg-accent/30"
                  : "border-muted-foreground/30 bg-muted/30"
              )}
            >
              <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
