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
import { AISummaryCard } from "@/app/mail/components/ai/ai-summary-card"
import { AISmartReplies } from "@/app/mail/components/ai/ai-smart-replies"
import { useAIConfig } from "@/app/mail/use-ai-config"
import type { AnalyzeEmailResponse } from "@/lib/ai/types"
import { QuotedTextCollapse } from "@/app/mail/components/quoted-text-collapse"
import { CalendarEventPreview } from "@/app/mail/components/calendar-event-preview"
import { LabelBadges } from "@/app/mail/components/label-badges"
import { FollowUpReminder } from "@/app/mail/components/follow-up-reminder"
import { AddLabelDialog } from "@/app/mail/components/add-label-dialog"
import { blockRemoteImages, unblockImages, hasRemoteImages } from "@/app/mail/utils/image-blocker"
import { parseEmail } from "@/app/mail/utils/email-parser"
import { parseFirstEvent } from "@/app/mail/utils/ics-parser"
import type { CalendarEvent } from "@/app/mail/utils/ics-parser"

interface MailDisplayProps {
  mail: Mail | undefined
  onReply?: (mail: Mail) => void
  onReplyAll?: (mail: Mail) => void
  onForward?: (mail: Mail) => void
}

export function MailDisplay({ mail: mailProp, onReply, onReplyAll, onForward }: MailDisplayProps) {
  const today = new Date()
  const [mail, setMail] = useMail()
  const { toggleStar, addLabel, removeLabel, markAsUnread, snoozeMail, archiveMail, deleteMail } = useMailActions()
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
  const [showSnoozeMenu, setShowSnoozeMenu] = React.useState(false)
  const [showLabelDialog, setShowLabelDialog] = React.useState(false)
  const { isConfigured } = useAIConfig()
  const [aiAnalysis, setAiAnalysis] = React.useState<AnalyzeEmailResponse['data'] | null>(null)
  const [aiLoading, setAiLoading] = React.useState(false)

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

  const handleArchive = () => {
    if (!mailProp) return
    archiveMail(mailProp.id)
    setMail({ ...mail, selected: null })
  }

  const handleMoveToJunk = () => {
    if (!mailProp) return
    addLabel(mailProp.id, "Junk")
    archiveMail(mailProp.id)
    setMail({ ...mail, selected: null })
  }

  const handleTrash = () => {
    if (!mailProp) return
    deleteMail(mailProp.id)
    setMail({ ...mail, selected: null })
  }

  const handleSnooze = (snoozeUntil: Date) => {
    if (!mailProp) return
    snoozeMail(mailProp.id, snoozeUntil)
    setMail({ ...mail, selected: null })
  }

  const handleReply = () => {
    if (!mailProp || !onReply) return
    onReply(mailProp)
  }

  const handleReplyAll = () => {
    if (!mailProp || !onReplyAll) return
    onReplyAll(mailProp)
  }

  const handleForward = () => {
    if (!mailProp || !onForward) return
    onForward(mailProp)
  }

  const fetchAIAnalysis = React.useCallback(async () => {
    if (!mailProp || !isConfigured) return

    try {
      setAiLoading(true)
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: mailProp.email,
          subject: mailProp.subject,
          body: mailProp.text || mailProp.snippet || '',
          analyzePriority: true,
          analyzeSentiment: true,
          extractActions: true,
          classifyCategory: false,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setAiAnalysis(data.data)
      }
    } catch (error) {
      console.error('AI analysis error:', error)
    } finally {
      setAiLoading(false)
    }
  }, [mailProp, isConfigured])

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

    // Use HTML content if available, otherwise fall back to text
    const contentToUse = mailProp.html || mailProp.text
    const isHtmlContent = !!mailProp.html

    // Get main content (content before first quoted section or full text if no quotes)
    let mainContent = contentToUse
    if (!isHtmlContent && parsed.quotedSections.length > 0) {
      // Only parse quotes for plain text emails
      const firstQuoteIndex = parsed.quotedSections[0].startIndex
      mainContent = lines.slice(0, firstQuoteIndex).join("\n").trim()
    }

    setParsedEmail({
      mainContent: isHtmlContent ? contentToUse : mainContent,
      quotedSections: isHtmlContent ? [] : quotedSections, // Don't show quotes UI for HTML emails
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

    if (isHtmlContent && shouldBlock && hasRemoteImages(mainContent)) {
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

  // Fetch AI analysis when mail changes
  React.useEffect(() => {
    if (mailProp && isConfigured) {
      fetchAIAnalysis()
    } else {
      setAiAnalysis(null)
    }
  }, [mailProp, isConfigured, fetchAIAnalysis])

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
              <Button variant="ghost" size="icon" disabled={!mailProp} onClick={handleArchive}>
                <Archive className="h-4 w-4" />
                <span className="sr-only">Archive</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Archive</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mailProp} onClick={handleMoveToJunk}>
                <ArchiveX className="h-4 w-4" />
                <span className="sr-only">Move to junk</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to junk</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mailProp} onClick={handleTrash}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Move to trash</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to trash</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mailProp}>
                    <Clock className="h-4 w-4" />
                    <span className="sr-only">Snooze</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Snooze</TooltipContent>
              </Tooltip>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Snooze until</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSnooze(addHours(new Date(), 4))}>
                Later today ({format(addHours(new Date(), 4), "h:mm a")})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSnooze(addDays(new Date(), 1))}>
                Tomorrow ({format(addDays(new Date(), 1), "EEE h:mm a")})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSnooze(nextSaturday(new Date()))}>
                This weekend ({format(nextSaturday(new Date()), "EEE h:mm a")})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSnooze(addDays(new Date(), 7))}>
                Next week ({format(addDays(new Date(), 7), "EEE h:mm a")})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
              <Button variant="ghost" size="icon" disabled={!mailProp} onClick={handleReply}>
                <Reply className="h-4 w-4" />
                <span className="sr-only">Reply</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mailProp} onClick={handleReplyAll}>
                <ReplyAll className="h-4 w-4" />
                <span className="sr-only">Reply all</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply all</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mailProp} onClick={handleForward}>
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
            <DropdownMenuItem onClick={() => mailProp && toggleStar(mailProp.id)}>
              {mailProp?.starred ? "Unstar thread" : "Star thread"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowLabelDialog(true)}>
              Add label
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("Mute thread - TODO")}>
              Mute thread
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />

      {/* Label Dialog */}
      {mailProp && (
        <AddLabelDialog
          open={showLabelDialog}
          onOpenChange={setShowLabelDialog}
          mailId={mailProp.id}
          onAddLabel={(label) => addLabel(mailProp.id, label)}
          onRemoveLabel={(label) => removeLabel(mailProp.id, label)}
        />
      )}
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

          {/* AI Summary */}
          {isConfigured && aiAnalysis && (
            <div className="px-4 pt-4">
              <AISummaryCard
                summary={`Email from ${mailProp.name || mailProp.email}${aiAnalysis.category ? ` - ${aiAnalysis.category}` : ''}`}
                priority={aiAnalysis.priority}
                priorityConfidence={aiAnalysis.priorityConfidence}
                sentiment={aiAnalysis.sentiment}
                sentimentConfidence={aiAnalysis.sentimentConfidence}
                actionItems={aiAnalysis.actionItems}
                onDismiss={() => setAiAnalysis(null)}
              />
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
            {/* AI Smart Replies */}
            {isConfigured && (
              <AISmartReplies
                mail={mailProp}
                onSelectReply={(text) => {
                  // TODO: Populate reply field with selected text
                  console.log('Selected reply:', text)
                }}
              />
            )}
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
