"use client"

import * as React from "react"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  User,
  Repeat,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CalendarEvent } from "@/app/mail/utils/ics-parser"
import { formatDateRange, formatDuration } from "@/app/mail/utils/ics-parser"

interface CalendarEventPreviewProps {
  event: CalendarEvent
  className?: string
}

export function CalendarEventPreview({
  event,
  className,
}: CalendarEventPreviewProps) {
  const dateRangeText = formatDateRange(
    event.startDate,
    event.endDate,
    event.isAllDay,
    event.timezone
  )
  const durationText = formatDuration(event.startDate, event.endDate)

  const acceptedCount = event.attendees.filter(
    (a) => a.status === "accepted"
  ).length
  const totalCount = event.attendees.length

  return (
    <div
      className={cn(
        "border-2 border-primary/30 rounded-lg p-4 bg-accent/20",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 mt-0.5">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base leading-snug">
            {event.summary}
          </h3>
          {event.status && event.status !== "confirmed" && (
            <span
              className={cn(
                "inline-block px-2 py-0.5 text-xs font-medium rounded mt-1",
                event.status === "cancelled"
                  ? "bg-destructive/20 text-destructive"
                  : "bg-accent text-muted-foreground"
              )}
            >
              {event.status}
            </span>
          )}
        </div>
      </div>

      {/* Date and time */}
      <div className="space-y-2 mb-3">
        <div className="flex items-start gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-foreground">{dateRangeText}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {durationText}
              {event.timezone && ` · ${event.timezone}`}
            </p>
          </div>
        </div>

        {/* Recurrence */}
        {event.recurrence && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Repeat className="h-4 w-4 flex-shrink-0" />
            <span>{event.recurrence}</span>
          </div>
        )}

        {/* Location */}
        {event.location && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-foreground line-clamp-2">{event.location}</p>
          </div>
        )}

        {/* Organizer */}
        {event.organizer && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <p className="text-muted-foreground">
              Organized by{" "}
              <span className="text-foreground">
                {event.organizer.name || event.organizer.email}
              </span>
            </p>
          </div>
        )}

        {/* Attendees */}
        {event.attendees.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <p className="text-muted-foreground">
              {totalCount} {totalCount === 1 ? "guest" : "guests"}
              {acceptedCount > 0 && (
                <span className="text-foreground">
                  {" "}
                  · {acceptedCount} accepted
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Description preview */}
      {event.description && (
        <div className="mb-3 p-3 bg-muted/30 rounded border border-border">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {event.description}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <Button size="sm" variant="default" className="text-xs h-7">
          Add to Calendar
        </Button>
        {event.url && (
          <Button
            size="sm"
            variant="ghost"
            className="text-xs h-7"
            onClick={() => window.open(event.url, "_blank")}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View Details
          </Button>
        )}
      </div>
    </div>
  )
}
