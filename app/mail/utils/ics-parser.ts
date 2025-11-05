/**
 * ICS/iCalendar parser utilities for calendar event previews
 */

import ICAL from "ical.js"

export interface CalendarEvent {
  summary: string // Event title
  description?: string
  location?: string
  startDate: Date
  endDate: Date
  timezone?: string
  organizer?: {
    name?: string
    email?: string
  }
  attendees: Array<{
    name?: string
    email?: string
    role?: "required" | "optional" | "chair"
    status?: "accepted" | "declined" | "tentative" | "needs-action"
  }>
  isAllDay: boolean
  recurrence?: string
  status?: "confirmed" | "tentative" | "cancelled"
  url?: string
}

/**
 * Parse ICS file content and extract calendar events
 */
export function parseICS(icsContent: string): CalendarEvent[] {
  try {
    const jcalData = ICAL.parse(icsContent)
    const comp = new ICAL.Component(jcalData)
    const vevents = comp.getAllSubcomponents("vevent")

    return vevents.map((vevent) => {
      const event = new ICAL.Event(vevent)

      // Extract basic event info
      const summary = event.summary || "Untitled Event"
      const description = event.description || undefined
      const location = event.location || undefined

      // Extract dates
      const startDate = event.startDate?.toJSDate() || new Date()
      const endDate = event.endDate?.toJSDate() || new Date()
      const isAllDay = !event.startDate?.isDate === false // Check if it's a date-only event

      // Extract timezone
      const timezone = event.startDate?.zone?.tzid || undefined

      // Extract organizer
      const organizerProp = vevent.getFirstProperty("organizer")
      let organizer: CalendarEvent["organizer"] = undefined
      if (organizerProp) {
        const organizerValue = organizerProp.getFirstValue()
        const email = typeof organizerValue === 'string' ? organizerValue.replace("mailto:", "") : undefined
        const nameParam = organizerProp.getParameter("cn")
        const name = typeof nameParam === 'string' ? nameParam : undefined
        organizer = { email, name }
      }

      // Extract attendees
      const attendeeProps = vevent.getAllProperties("attendee")
      const attendees: CalendarEvent["attendees"] = attendeeProps.map((prop) => {
        const attendeeValue = prop.getFirstValue()
        const email = typeof attendeeValue === 'string' ? attendeeValue.replace("mailto:", "") : undefined
        const nameParam = prop.getParameter("cn")
        const name = typeof nameParam === 'string' ? nameParam : undefined
        const roleParam = prop.getParameter("role")
        const roleValue = typeof roleParam === 'string' ? roleParam.toLowerCase() : undefined
        const role = roleValue as "required" | "optional" | "chair" | undefined
        const partstatParam = prop.getParameter("partstat")
        const partstatValue = typeof partstatParam === 'string' ? partstatParam.toLowerCase() : undefined
        const partstat = partstatValue as
          | "accepted"
          | "declined"
          | "tentative"
          | "needs-action"
          | undefined

        return {
          email,
          name,
          role: role || "required",
          status: partstat || "needs-action",
        }
      })

      // Extract recurrence rule if present
      const rruleProp = vevent.getFirstProperty("rrule")
      const recurrence = rruleProp
        ? formatRecurrence(rruleProp.getFirstValue())
        : undefined

      // Extract status
      const statusProp = vevent.getFirstProperty("status")
      const statusValue = statusProp?.getFirstValue()
      const statusLower = typeof statusValue === 'string' ? statusValue.toLowerCase() : undefined
      const status = statusLower as "confirmed" | "tentative" | "cancelled" | undefined

      // Extract URL
      const urlProp = vevent.getFirstProperty("url")
      const urlValue = urlProp?.getFirstValue()
      const url = urlValue && typeof urlValue === 'string' ? urlValue : undefined

      return {
        summary,
        description,
        location,
        startDate,
        endDate,
        timezone,
        organizer,
        attendees,
        isAllDay,
        recurrence,
        status,
        url,
      }
    })
  } catch (error) {
    console.error("Failed to parse ICS content:", error)
    return []
  }
}

/**
 * Format recurrence rule into human-readable text
 */
function formatRecurrence(rrule: any): string {
  try {
    const freq = rrule.freq
    const interval = rrule.interval || 1
    const count = rrule.count
    const until = rrule.until

    let result = ""

    // Frequency
    const freqMap: Record<string, string> = {
      DAILY: "day",
      WEEKLY: "week",
      MONTHLY: "month",
      YEARLY: "year",
    }

    const freqText = freqMap[freq] || freq.toLowerCase()

    if (interval === 1) {
      result = `Every ${freqText}`
    } else {
      result = `Every ${interval} ${freqText}s`
    }

    // Count or until
    if (count) {
      result += `, ${count} times`
    } else if (until) {
      const untilDate = new Date(until)
      result += ` until ${untilDate.toLocaleDateString()}`
    }

    // Days of week for weekly recurrence
    if (freq === "WEEKLY" && rrule.byday) {
      const days = Array.isArray(rrule.byday) ? rrule.byday : [rrule.byday]
      const dayNames = days.map((d: string) => {
        const dayMap: Record<string, string> = {
          SU: "Sunday",
          MO: "Monday",
          TU: "Tuesday",
          WE: "Wednesday",
          TH: "Thursday",
          FR: "Friday",
          SA: "Saturday",
        }
        return dayMap[d] || d
      })
      result += ` on ${dayNames.join(", ")}`
    }

    return result
  } catch (error) {
    console.error("Failed to format recurrence rule:", error)
    return "Recurring event"
  }
}

/**
 * Check if content is valid ICS format
 */
export function isValidICS(content: string): boolean {
  try {
    ICAL.parse(content)
    return true
  } catch {
    return false
  }
}

/**
 * Extract first event from ICS content (most common case)
 */
export function parseFirstEvent(icsContent: string): CalendarEvent | null {
  const events = parseICS(icsContent)
  return events.length > 0 ? events[0] : null
}

/**
 * Format date range for display
 */
export function formatDateRange(
  startDate: Date,
  endDate: Date,
  isAllDay: boolean,
  timezone?: string
): string {
  const sameDay =
    startDate.toDateString() === endDate.toDateString()

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }

  if (isAllDay) {
    if (sameDay) {
      return startDate.toLocaleDateString(undefined, dateOptions)
    } else {
      return `${startDate.toLocaleDateString(
        undefined,
        dateOptions
      )} - ${endDate.toLocaleDateString(undefined, dateOptions)}`
    }
  }

  if (sameDay) {
    const dateStr = startDate.toLocaleDateString(undefined, dateOptions)
    const startTime = startDate.toLocaleTimeString(undefined, timeOptions)
    const endTime = endDate.toLocaleTimeString(undefined, timeOptions)
    return `${dateStr} · ${startTime} - ${endTime}`
  }

  const startStr = `${startDate.toLocaleDateString(
    undefined,
    dateOptions
  )} ${startDate.toLocaleTimeString(undefined, timeOptions)}`
  const endStr = `${endDate.toLocaleDateString(
    undefined,
    dateOptions
  )} ${endDate.toLocaleTimeString(undefined, timeOptions)}`

  return `${startStr} - ${endStr}`
}

/**
 * Get duration in human-readable format
 */
export function formatDuration(startDate: Date, endDate: Date): string {
  const diffMs = endDate.getTime() - startDate.getTime()
  const diffMins = Math.floor(diffMs / 1000 / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""}`
  }
  if (diffHours > 0) {
    const remainingMins = diffMins % 60
    if (remainingMins > 0) {
      return `${diffHours}h ${remainingMins}m`
    }
    return `${diffHours} hour${diffHours > 1 ? "s" : ""}`
  }
  return `${diffMins} minute${diffMins > 1 ? "s" : ""}`
}
