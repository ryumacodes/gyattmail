"use client"

import * as React from "react"
import { addDays, addHours, format, nextSaturday } from "date-fns"
import {
  Archive,
  ArchiveX,
  ArrowLeft,
  Clock,
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  Star,
  Trash2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Mail } from "@/app/mail/data"
import { useMail } from "@/app/mail/use-mail"
import { useMailActions } from "@/app/mail/use-mail-actions"
import { useTrustedSenders } from "@/app/mail/use-trusted-senders"
import { RemoteImagesBlockedBanner } from "@/app/mail/components/remote-images-blocked-banner"
import { QuotedTextCollapse } from "@/app/mail/components/quoted-text-collapse"
import { CalendarEventPreview } from "@/app/mail/components/calendar-event-preview"
import { LabelBadges } from "@/app/mail/components/label-badges"
import { FollowUpReminder } from "@/app/mail/components/follow-up-reminder"
import { blockRemoteImages, unblockImages, hasRemoteImages } from "@/app/mail/utils/image-blocker"
import { parseEmail } from "@/app/mail/utils/email-parser"
import { parseFirstEvent } from "@/app/mail/utils/ics-parser"
import type { CalendarEvent } from "@/app/mail/utils/ics-parser"

interface MailDisplayProps {
  mail: Mail | undefined
}

export function MailDisplay({ mail: mailProp }: MailDisplayProps) {
  const today = new Date()
  const [mail, setMail] = useMail()
  const { toggleStar, addLabel, removeLabel, markAsUnread, snoozeMail } = useMailActions()
  const { isTrusted, trustDomain } = useTrustedSenders()
  const [isStarAnimating, setIsStarAnimating] = React.useState(false)
  const [displayedHtml, setDisplayedHtml] = React.useState<string>("")
  const [imagesBlocked, setImagesBlocked] = React.useState(false)
  const [blockedCount, setBlockedCount] = React.useState(0)
  const [imagesShown, setImagesShown] = React.useState(false)
  const [parsedEmail, setParsedEmail] = React.useState<{
    mainContent: string
    quotedSections: Array<{ content: string; type: "reply" | "forward" | "quote" }>
  } | null>(null)
  const [calendarEvents, setCalendarEvents] = React.useState<CalendarEvent[]>([])

  const handleBack = () => {
    setMail({ ...mail, selected: null })
  }

  const handleToggleStar = () => {
    if (!mailProp) return

    toggleStar(mailProp.id)

    // Trigger animation
    setIsStarAnimating(true)
    setTimeout(() => {
      setIsStarAnimating(false)
    }, 400) // Match animation duration
  }

  // Process email content for image blocking, quote detection, and ICS parsing
  React.useEffect(() => {
    if (!mailProp) {
      setDisplayedHtml("")
      setImagesBlocked(false)
      setBlockedCount(0)
      setImagesShown(false)
      setParsedEmail(null)
      setCalendarEvents([])
      return
    }

    // Parse email for quoted sections
    const parsed = parseEmail(mailProp.text)
    const lines = mailProp.text.split("\n")

    // Extract quoted sections
    const quotedSections = parsed.quotedSections.map((section) => ({
      content: lines.slice(section.startIndex, section.endIndex + 1).join("\n"),
      type: section.type,
    }))

    // Get main content (content before first quoted section or full text if no quotes)
    let mainContent = mailProp.text
    if (parsed.quotedSections.length > 0) {
      const firstQuoteIndex = parsed.quotedSections[0].startIndex
      mainContent = lines.slice(0, firstQuoteIndex).join("\n").trim()
    }

    setParsedEmail({
      mainContent,
      quotedSections,
    })

    // Parse ICS attachments for calendar events
    const events: CalendarEvent[] = []
    if (mailProp.attachments) {
      mailProp.attachments.forEach((attachment: any) => {
        if (
          attachment.type === "text/calendar" &&
          attachment.icsContent
        ) {
          const event = parseFirstEvent(attachment.icsContent)
          if (event) {
            events.push(event)
          }
        }
      })
    }
    setCalendarEvents(events)

    // Check if blocking is enabled and sender is not trusted
    const shouldBlock = mail.blockRemoteImages && !isTrusted(mailProp.email)

    if (shouldBlock && hasRemoteImages(mainContent)) {
      const result = blockRemoteImages(mainContent)
      setDisplayedHtml(result.blockedHtml)
      setImagesBlocked(true)
      setBlockedCount(result.blockedCount)
      setImagesShown(false)
    } else {
      setDisplayedHtml(mainContent)
      setImagesBlocked(false)
      setBlockedCount(0)
      setImagesShown(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mailProp, mail.blockRemoteImages])

  const handleShowImages = () => {
    if (!mailProp || !imagesBlocked) return

    // Unblock images in the current email
    const unblocked = unblockImages(displayedHtml)
    setDisplayedHtml(unblocked)
    setImagesShown(true)
  }

  const handleTrustSender = () => {
    if (!mailProp) return

    // Trust the entire domain
    trustDomain(mailProp.email)
    handleShowImages()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to list</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back to list</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mailProp}>
                <Archive className="h-4 w-4" />
                <span className="sr-only">Archive</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Archive</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mailProp}>
                <ArchiveX className="h-4 w-4" />
                <span className="sr-only">Move to junk</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to junk</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mailProp}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Move to trash</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to trash</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mailProp}>
                <Clock className="h-4 w-4" />
                <span className="sr-only">Snooze</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Snooze</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={!mailProp}
                onClick={handleToggleStar}
                className={cn(
                  "transition-all",
                  isStarAnimating && "animate-star-bounce"
                )}
              >
                <Star
                  className={cn(
                    "h-4 w-4 transition-colors",
                    mailProp?.starred
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  )}
                />
                <span className="sr-only">{mailProp?.starred ? "Unstar" : "Star"}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{mailProp?.starred ? "Unstar" : "Star"}</TooltipContent>
          </Tooltip>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mailProp}>
                <Reply className="h-4 w-4" />
                <span className="sr-only">Reply</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mailProp}>
                <ReplyAll className="h-4 w-4" />
                <span className="sr-only">Reply all</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply all</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mailProp}>
                <Forward className="h-4 w-4" />
                <span className="sr-only">Forward</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Forward</TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!mailProp}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {mailProp?.threadId && (
              <>
                <DropdownMenuItem onClick={() => mailProp && markAsUnread(mailProp.id)}>
                  Mark unread from here
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => mailProp && markAsUnread(mailProp.id)}>
              Mark as unread
            </DropdownMenuItem>
            <DropdownMenuItem>Star thread</DropdownMenuItem>
            <DropdownMenuItem>Add label</DropdownMenuItem>
            <DropdownMenuItem>Mute thread</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      {mailProp ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-start p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage alt={mailProp.name} />
                <AvatarFallback>
                  {mailProp.name
                    .split(" ")
                    .map((chunk) => chunk[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold">{mailProp.name}</div>
                <div className="line-clamp-1 text-xs">{mailProp.subject}</div>
                <div className="line-clamp-1 text-xs">
                  <span className="font-medium">Reply-To:</span> {mailProp.email}
                </div>
              </div>
            </div>
            {mailProp.date && (
              <div className="ml-auto text-xs text-muted-foreground">
                {format(new Date(mailProp.date), "PPpp")}
              </div>
            )}
          </div>

          {/* Label badges - always show to allow adding labels */}
          <div className="px-4 pb-3">
            <LabelBadges
              labels={mailProp.labels || []}
              mailId={mailProp.id}
              onAddLabel={(label) => addLabel(mailProp.id, label)}
              onRemoveLabel={(label) => removeLabel(mailProp.id, label)}
            />
          </div>

          {/* Follow-up reminder - only show if not replied and not snoozed */}
          {mailProp.repliedTo === false && !mailProp.snoozeUntil && (
            <div className="px-4 pb-3">
              <FollowUpReminder
                mailId={mailProp.id}
                onSnooze={(snoozeUntil) => snoozeMail(mailProp.id, snoozeUntil)}
              />
            </div>
          )}

          <Separator />

          {/* Remote Images Blocked Banner */}
          {imagesBlocked && !imagesShown && (
            <div className="px-4 pt-4">
              <RemoteImagesBlockedBanner
                blockedCount={blockedCount}
                senderEmail={mailProp.email}
                onShowImages={handleShowImages}
                onTrustSender={handleTrustSender}
              />
            </div>
          )}

          {/* Calendar Event Previews */}
          {calendarEvents.length > 0 && (
            <div className="px-4 pt-4 space-y-3">
              {calendarEvents.map((event, index) => (
                <CalendarEventPreview key={index} event={event} />
              ))}
            </div>
          )}

          <div className="flex-1 p-4">
            <div
              className="whitespace-pre-wrap text-foreground leading-relaxed"
              style={{ fontSize: `${mail.fontSize}px` }}
              dangerouslySetInnerHTML={{ __html: displayedHtml || mailProp.text }}
            />

            {/* Quoted text collapse */}
            {parsedEmail && parsedEmail.quotedSections.length > 0 && (
              <QuotedTextCollapse quotedSections={parsedEmail.quotedSections} />
            )}
          </div>
          <Separator className="mt-auto" />
          <div className="p-4">
            <form>
              <div className="grid gap-4">
                <Textarea
                  className="p-4"
                  placeholder={`Reply ${mailProp.name}...`}
                />
                <div className="flex items-center">
                  <Button
                    onClick={(e) => e.preventDefault()}
                    size="sm"
                    className="ml-auto"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No message selected
        </div>
      )}
    </div>
  )
}
