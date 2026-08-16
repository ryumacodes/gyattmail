"use client"

import * as React from "react"
import { addDays, addHours, startOfDay, nextMonday } from "date-fns"
import { Clock, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface FollowUpReminderProps {
  mailId: string
  onSnooze: (snoozeUntil: Date) => void
  className?: string
}

export function FollowUpReminder({
  mailId,
  onSnooze,
  className,
}: FollowUpReminderProps) {
  const handleSnooze = (hours?: number, days?: number, nextWeek?: boolean) => {
    let snoozeUntil: Date

    if (nextWeek) {
      // Next Monday at 9am
      snoozeUntil = nextMonday(new Date())
      snoozeUntil.setHours(9, 0, 0, 0)
    } else if (days) {
      if (days === 1) {
        // Tomorrow at 9am
        snoozeUntil = addDays(startOfDay(new Date()), 1)
        snoozeUntil.setHours(9, 0, 0, 0)
      } else {
        // N days from now, same time
        snoozeUntil = addDays(new Date(), days)
      }
    } else if (hours) {
      // N hours from now
      snoozeUntil = addHours(new Date(), hours)
    } else {
      // Default: 2 days from now
      snoozeUntil = addDays(new Date(), 2)
    }

    onSnooze(snoozeUntil)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-7 gap-1 text-xs border-2 hover:bg-accent transition-colors",
            className
          )}
        >
          <Clock className="h-3 w-3" />
          <span>Remind me</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem onClick={() => handleSnooze(4)}>
          <Clock className="mr-2 h-4 w-4" />
          Later today
          <span className="ml-auto text-xs text-muted-foreground">4 hours</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSnooze(undefined, 1)}>
          <Clock className="mr-2 h-4 w-4" />
          Tomorrow
          <span className="ml-auto text-xs text-muted-foreground">9 AM</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSnooze(undefined, 2)}>
          <Clock className="mr-2 h-4 w-4" />
          In 2 days
          <span className="ml-auto text-xs text-muted-foreground">Default</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSnooze(undefined, undefined, true)}>
          <Clock className="mr-2 h-4 w-4" />
          Next week
          <span className="ml-auto text-xs text-muted-foreground">Mon 9 AM</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <Clock className="mr-2 h-4 w-4 opacity-50" />
          <span className="text-muted-foreground">Custom...</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
