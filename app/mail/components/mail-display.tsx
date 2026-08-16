"use client"

import * as React from "react"
import DOMPurify from 'dompurify'
import { aiFetch } from "@/lib/ai/client-fetch"
import { addDays, addHours, format, nextSaturday } from "date-fns"
import {
  Archive,
  ArchiveX,
  ArrowLeft,
  Clock,
  Forward,
  Download,
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
  onReply?: (mail: Mail, prefilledBody?: string) => void
  onReplyAll?: (mail: Mail) => void
  onForward?: (mail: Mail) => void
}

export function MailDisplay({ mail: mailProp, onReply, onReplyAll, onForward }: MailDisplayProps) {
  const today = new Date()
  const [mail, setMail] = useMail()
  const { toggleStar, addLabel, removeLabel, markAsUnread, snoozeMail, archiveMail, deleteMail, spamMail, restoreMail } = useMailActions()
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
  const [aiAnalysis, setAiAnalysis] = React.useState<AnalyzeEmailResponse | null>(null)
  const [aiLoading, setAiLoading] = React.useState(false)
  const [quickReply, setQuickReply] = React.useState('')
  const [quickReplySending, setQuickReplySending] = React.useState(false)

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
    spamMail(mailProp.id)
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

    setAiLoading(true)
    setAiAnalysis(null)

    try {
      const response = await aiFetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: mailProp.email,
          subject: mailProp.subject,
          body: mailProp.text || '',
          analyzePriority: true,
          analyzeSentiment: true,
          extractActions: true,
          classifyCategory: false,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Extract analysis data (API returns { success: true, ...AnalyzeEmailResponse })
        const { success, ...analysis } = data
        setAiAnalysis(analysis)
      } else {
        setAiAnalysis(null)
      }
    } catch (error) {
      console.error('AI analysis error:', error)
      setAiAnalysis(null)
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
    const contentToUse = mailProp.html ? DOMPurify.sanitize(mailProp.html) : DOMPurify.sanitize(mailProp.text)
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
      mailProp.attachments.forEach((attachment) => {
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

  const sendQuickReply = async () => {
    if (!mailProp || !quickReply.trim()) return
    setQuickReplySending(true)
    try {
      const response = await fetch('/api/mail/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        accountId: mailProp.accountId, to: [mailProp.email], subject: mailProp.subject.startsWith('Re:') ? mailProp.subject : `Re: ${mailProp.subject}`, text: quickReply,
      }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Reply failed')
      setQuickReply('')
    } finally { setQuickReplySending(false) }
  }

  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden">
      <div className="hatch-edge-bottom sticky top-0 z-30 flex min-h-14 shrink-0 items-center overflow-x-auto bg-background/95 p-1.5 backdrop-blur md:p-2">
        <div className="flex shrink-0 items-center gap-0.5 md:gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleBack} className="size-11 md:size-9">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to list</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back to list</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mailProp} onClick={() => mailProp?.deleted ? restoreMail(mailProp.id) : handleArchive()} className="size-11 md:size-9">
                <Archive className="h-4 w-4" />
                <span className="sr-only">{mailProp?.deleted ? 'Restore' : 'Archive'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{mailProp?.deleted ? 'Restore to inbox' : 'Archive'}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mailProp} onClick={handleMoveToJunk} className="hidden size-11 md:size-9 lg:inline-flex">
                <ArchiveX className="h-4 w-4" />
                <span className="sr-only">Move to junk</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to junk</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mailProp} onClick={handleTrash} className="size-11 md:size-9">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Move to trash</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{mailProp?.deleted ? 'Delete permanently' : 'Move to trash'}</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!mailProp} className="hidden size-11 md:size-9 lg:inline-flex">
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
                  "size-11 transition-all md:size-9",
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
        <div className="ml-auto flex shrink-0 items-center gap-0.5 md:gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mailProp} onClick={handleReply} className="size-11 md:size-9">
                <Reply className="h-4 w-4" />
                <span className="sr-only">Reply</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mailProp} onClick={handleReplyAll} className="hidden size-11 md:size-9 lg:inline-flex">
                <ReplyAll className="h-4 w-4" />
                <span className="sr-only">Reply all</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply all</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mailProp} onClick={handleForward} className="hidden size-11 md:size-9 lg:inline-flex">
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
            <Button variant="ghost" size="icon" disabled={!mailProp} className="size-11 md:size-9">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="lg:hidden" onClick={handleReplyAll}>Reply all</DropdownMenuItem>
            <DropdownMenuItem className="lg:hidden" onClick={handleForward}>Forward</DropdownMenuItem>
            <DropdownMenuItem className="lg:hidden" onClick={handleMoveToJunk}>Move to junk</DropdownMenuItem>
            <DropdownMenuItem className="lg:hidden" onClick={() => handleSnooze(addDays(new Date(), 1))}>Snooze until tomorrow</DropdownMenuItem>
            <DropdownMenuSeparator className="lg:hidden" />
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
            <DropdownMenuItem onClick={() => {
              if (!mailProp) return
              const isMuted = mailProp.labels.includes("Muted")
              if (isMuted) {
                removeLabel(mailProp.id, "Muted")
              } else {
                addLabel(mailProp.id, "Muted")
                // Archive the thread to remove from inbox
                archiveMail(mailProp.id)
              }
            }}>
              {mailProp?.labels.includes("Muted") ? "Unmute thread" : "Mute thread"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          <div className="hatch-edge-bottom flex items-start gap-3 p-3 md:p-4">
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
              <div className="ml-auto max-w-28 shrink-0 text-right text-[11px] text-muted-foreground md:max-w-none md:text-xs">
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

          <Separator className="opacity-0" />

          {mailProp.threadMessages && mailProp.threadMessages.length > 1 && (
            <div className="space-y-2 border-b px-4 py-3">
              {mailProp.threadMessages.slice(0, -1).map((message) => (
                <details key={message.id} className="hatch-border rounded-md bg-paper-100 px-3 py-2">
                  <summary className="cursor-pointer text-sm font-medium">{message.name} · {format(new Date(message.date), 'PPp')}</summary>
                  <div className="prose prose-sm mt-3 max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.html || message.text) }} />
                </details>
              ))}
            </div>
          )}

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

          {mailProp.attachments && mailProp.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pt-4">
              {mailProp.attachments.map((attachment, index) => {
                const href = attachment.content
                  ? `data:${attachment.type};base64,${attachment.content}`
                  : attachment.id ? `/api/mail/attachments?emailId=${encodeURIComponent(mailProp.id)}&attachmentId=${encodeURIComponent(attachment.id)}` : undefined
                return (
                  <a
                    key={`${attachment.name}-${index}`}
                    href={href}
                    download={attachment.name}
                    className="hatch-border inline-flex max-w-full items-center gap-2 rounded-md bg-paper-100 px-3 py-2 text-xs hover:bg-paper-200"
                    aria-disabled={!href}
                  >
                    <Download className="size-4 shrink-0" />
                    <span className="truncate">{attachment.name}</span>
                    {attachment.size > 0 && (
                      <span className="text-muted-foreground">
                        {Math.ceil(attachment.size / 1024)} KB
                      </span>
                    )}
                  </a>
                )
              })}
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

          <div className="min-w-0 flex-1 p-3 md:p-4">
            <div
              className="mail-message-content min-w-0 overflow-x-auto whitespace-pre-wrap break-words text-foreground leading-relaxed"
              style={{ fontSize: `${mail.fontSize}px` }}
              dangerouslySetInnerHTML={{ __html: displayedHtml || mailProp.text }}
            />

            {/* Quoted text collapse */}
            {parsedEmail && parsedEmail.quotedSections.length > 0 && (
              <QuotedTextCollapse quotedSections={parsedEmail.quotedSections} />
            )}
          </div>
          <Separator className="mt-auto opacity-0" />
          <div className="hatch-edge-top p-3 pb-[max(1rem,env(safe-area-inset-bottom))] md:p-4">
            {/* AI Smart Replies */}
            {isConfigured && (
              <AISmartReplies
                mail={mailProp}
                onSelectReply={(text) => {
                  if (!onReply) return
                  onReply(mailProp, text)
                }}
              />
            )}
            <form>
              <div className="grid gap-4">
                <Textarea
                  className="hatch-inset p-4"
                  placeholder={`Reply ${mailProp.name}...`}
                  value={quickReply}
                  onChange={(event) => setQuickReply(event.target.value)}
                />
                <div className="flex items-center">
                  <Button
                    onClick={(e) => { e.preventDefault(); void sendQuickReply() }}
                    disabled={!quickReply.trim() || quickReplySending}
                    size="sm"
                    className="ml-auto"
                  >
                    {quickReplySending ? 'Sending…' : 'Send'}
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
