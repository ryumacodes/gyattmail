"use client"

import * as React from "react"
import { Paperclip, Send, Minimize2, Maximize2, Clock, X } from "lucide-react"
import type { EmailAttachment } from '@/lib/types/email'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { AIComposeToolbar } from "@/app/mail/components/ai/ai-compose-toolbar"
import { useAIConfig } from "@/app/mail/use-ai-config"
import type { MailPreferences } from '@/lib/types/mail-preferences'

interface ComposeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accounts: Array<{ id: string; email: string; label: string }>
  defaultAccount?: string
  // For replies/forwards
  replyTo?: {
    to: string
    subject: string
    body: string
    messageId?: string
  }
}

export function ComposeDialog({
  open,
  onOpenChange,
  accounts,
  defaultAccount,
  replyTo,
}: ComposeDialogProps) {
  const [selectedAccount, setSelectedAccount] = React.useState(
    defaultAccount || accounts[0]?.id || ""
  )
  const [to, setTo] = React.useState("")
  const [cc, setCc] = React.useState("")
  const [bcc, setBcc] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [body, setBody] = React.useState("")
  const [showCc, setShowCc] = React.useState(false)
  const [showBcc, setShowBcc] = React.useState(false)
  const [isSending, setIsSending] = React.useState(false)
  const [isMinimized, setIsMinimized] = React.useState(false)
  const [attachments, setAttachments] = React.useState<EmailAttachment[]>([])
  const [draftId, setDraftId] = React.useState<string>()
  const [sendAt, setSendAt] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [preferences, setPreferences] = React.useState<MailPreferences>()
  const { isConfigured } = useAIConfig()

  React.useEffect(() => {
    void fetch('/api/mail/preferences')
      .then((response) => response.json())
      .then((result) => setPreferences(result.preferences))
  }, [])

  // Update selected account when defaultAccount changes
  React.useEffect(() => {
    if (defaultAccount) {
      setSelectedAccount(defaultAccount)
    }
  }, [defaultAccount])

  // Update form when replyTo changes
  React.useEffect(() => {
    if (replyTo) {
      setTo(replyTo.to)
      setSubject(replyTo.subject)
      setBody(replyTo.body)
      // Show Cc/Bcc if they have recipients in replyTo
      setShowCc(replyTo.to.includes(","))
      setShowBcc(false)
    }
  }, [replyTo])

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      // Small delay to allow close animation
      setTimeout(() => {
        if (!replyTo) {
          setTo("")
          setCc("")
          setBcc("")
          setSubject("")
          setBody("")
          setShowCc(false)
          setShowBcc(false)
        }
      }, 300)
    }
  }, [open, replyTo])

  const draftPayload = React.useCallback((status: 'draft' | 'scheduled' = 'draft') => ({
    id: draftId,
    accountId: selectedAccount,
    to: to.split(',').map((value) => value.trim()).filter(Boolean),
    cc: cc.split(',').map((value) => value.trim()).filter(Boolean),
    bcc: bcc.split(',').map((value) => value.trim()).filter(Boolean),
    subject,
    text: body,
    attachments,
    inReplyTo: replyTo?.messageId,
    status,
    sendAt: status === 'scheduled' ? new Date(sendAt).toISOString() : undefined,
  }), [attachments, bcc, body, cc, draftId, replyTo?.messageId, selectedAccount, sendAt, subject, to])

  React.useEffect(() => {
    if (!open || !selectedAccount || (!to && !subject && !body && attachments.length === 0)) return
    const timer = window.setTimeout(async () => {
      const response = await fetch('/api/mail/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftPayload()),
      })
      const result = await response.json()
      if (response.ok && result.draft?.id) setDraftId(result.draft.id)
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [attachments.length, body, draftPayload, open, selectedAccount, subject, to])

  const handleFiles = async (files: FileList | null) => {
    if (!files) return
    const encoded = await Promise.all(Array.from(files).map((file) => new Promise<EmailAttachment>((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(reader.error)
      reader.onload = () => resolve({
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        size: file.size,
        content: String(reader.result).split(',')[1],
      })
      reader.readAsDataURL(file)
    })))
    setAttachments((current) => [...current, ...encoded])
  }

  const handleSchedule = async () => {
    if (!sendAt) return toast.error('Choose a send time')
    const response = await fetch('/api/mail/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draftPayload('scheduled')),
    })
    const result = await response.json()
    if (!response.ok) return toast.error(result.error || 'Unable to schedule message')
    setDraftId(result.draft.id)
    toast.success(`Scheduled for ${new Date(sendAt).toLocaleString()}`)
    onOpenChange(false)
  }

  const handleSend = async () => {
    // Validate
    if (!to.trim()) {
      toast.error("Please enter a recipient")
      return
    }

    if (!subject.trim()) {
      toast.error("Please enter a subject")
      return
    }

    if (!selectedAccount) {
      toast.error("Please select an account")
      return
    }

    setIsSending(true)

    try {
      const response = await fetch("/api/mail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: selectedAccount,
          to: to.split(",").map((e) => e.trim()).filter(Boolean),
          cc: cc ? cc.split(",").map((e) => e.trim()).filter(Boolean) : undefined,
          bcc: bcc ? bcc.split(",").map((e) => e.trim()).filter(Boolean) : undefined,
          subject: subject.trim(),
          text: `${body}${preferences?.signatures[selectedAccount] || preferences?.signatures.default ? `\n\n${preferences.signatures[selectedAccount] || preferences.signatures.default}` : ''}`,
          inReplyTo: replyTo?.messageId,
          attachments,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to send email")
      }

      toast.success("Email sent successfully!")
      if (draftId) await fetch(`/api/mail/drafts?id=${encodeURIComponent(draftId)}`, { method: 'DELETE' })
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to send email:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to send email"
      )
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-dvh w-screen max-w-none grid-rows-[auto_1fr] overflow-hidden rounded-none sm:h-auto sm:max-h-[90dvh] sm:max-w-[700px] sm:rounded-lg p-0 gap-0 bg-paper-200 border-hatched paper-grain">
        <DialogHeader className="px-4 pb-3 pt-[max(.75rem,env(safe-area-inset-top))] pr-12 border-b-2 border-hatch-600 flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-xl font-serif font-bold text-ink-700">
            {replyTo ? "Reply" : "New Message"}
          </DialogTitle>
          <div className="flex items-center gap-1 mr-2">
            <Button
              variant="ghost"
              size="icon"
              className="hidden h-8 w-8 hover:bg-hatch-200/50 sm:inline-flex"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </DialogHeader>

        {!isMinimized && (
          <div className="min-h-0 overflow-y-auto overscroll-contain flex flex-col gap-4 p-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
            {/* Account Selector (if multiple accounts) */}
            {accounts.length > 1 && (
              <div className="flex flex-col items-stretch gap-1 sm:flex-row sm:items-center sm:gap-3">
                <Label htmlFor="from" className="w-auto text-left text-sm font-medium text-ink-600 sm:w-20 sm:text-right">
                  From:
                </Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="hatch-inset flex-1 bg-paper-100">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent className="paper-grain">
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* To Field */}
            <div className="flex flex-col items-stretch gap-1 sm:flex-row sm:items-center sm:gap-3">
              <Label htmlFor="to" className="w-auto text-left text-sm font-medium text-ink-600 sm:w-20 sm:text-right">
                To:
              </Label>
              <div className="flex-1 flex items-center gap-2">
                <Input
                  id="to"
                  placeholder="Recipients (comma separated)"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="hatch-inset h-11 flex-1 bg-paper-100 text-base sm:h-9 sm:text-sm"
                />
                {!showCc && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCc(true)}
                    className="text-xs text-ink-600 hover:bg-hatch-200/50"
                  >
                    Cc
                  </Button>
                )}
                {!showBcc && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBcc(true)}
                    className="text-xs text-ink-600 hover:bg-hatch-200/50"
                  >
                    Bcc
                  </Button>
                )}
              </div>
            </div>

            {/* Cc Field */}
            {showCc && (
              <div className="flex flex-col items-stretch gap-1 sm:flex-row sm:items-center sm:gap-3">
                <Label htmlFor="cc" className="w-auto text-left text-sm font-medium text-ink-600 sm:w-20 sm:text-right">
                  Cc:
                </Label>
                <Input
                  id="cc"
                  placeholder="Carbon copy (comma separated)"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  className="hatch-inset h-11 flex-1 bg-paper-100 text-base sm:h-9 sm:text-sm"
                />
              </div>
            )}

            {/* Bcc Field */}
            {showBcc && (
              <div className="flex flex-col items-stretch gap-1 sm:flex-row sm:items-center sm:gap-3">
                <Label htmlFor="bcc" className="w-auto text-left text-sm font-medium text-ink-600 sm:w-20 sm:text-right">
                  Bcc:
                </Label>
                <Input
                  id="bcc"
                  placeholder="Blind carbon copy (comma separated)"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  className="hatch-inset h-11 flex-1 bg-paper-100 text-base sm:h-9 sm:text-sm"
                />
              </div>
            )}

            {/* Subject Field */}
            <div className="flex flex-col items-stretch gap-1 sm:flex-row sm:items-center sm:gap-3">
              <Label htmlFor="subject" className="w-auto text-left text-sm font-medium text-ink-600 sm:w-20 sm:text-right">
                Subject:
              </Label>
              <Input
                id="subject"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="hatch-inset h-11 flex-1 bg-paper-100 text-base sm:h-9 sm:text-sm"
              />
            </div>

            {/* Body Field */}
            <div className="flex flex-col gap-1 sm:flex-row sm:gap-3">
              <Label htmlFor="body" className="w-auto text-left text-sm font-medium text-ink-600 sm:w-20 sm:pt-2 sm:text-right">
                Message:
              </Label>
              <div className="flex-1 space-y-2">
                {/* AI Toolbar */}
                {isConfigured && (
                  <AIComposeToolbar
                    body={body}
                    onBodyChange={setBody}
                    to={to}
                    subject={subject}
                    replyTo={replyTo ? {
                      from: replyTo.to,
                      subject: replyTo.subject,
                      body: replyTo.body,
                    } : undefined}
                  />
                )}
                <Textarea
                  id="body"
                  placeholder="Write your message..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="hatch-inset min-h-[36dvh] resize-y bg-paper-100 text-base font-mono sm:min-h-[240px] sm:text-sm"
                />
              </div>
            </div>

            {preferences && preferences.snippets.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 sm:ml-23">
                <Label className="text-xs">Insert snippet</Label>
                <Select onValueChange={(id) => {
                  const snippet = preferences.snippets.find((item) => item.id === id)
                  if (snippet) {
                    setBody((current) => `${current}${current ? '\n\n' : ''}${snippet.body}`)
                  }
                }}>
                  <SelectTrigger className="max-w-64 bg-paper-100">
                    <SelectValue placeholder="Choose saved text…" />
                  </SelectTrigger>
                  <SelectContent>
                    {preferences.snippets.map((snippet) => (
                      <SelectItem key={snippet.id} value={snippet.id}>{snippet.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 sm:ml-23">
                {attachments.map((attachment, index) => (
                  <span
                    key={`${attachment.filename}-${index}`}
                    className="inline-flex items-center gap-2 rounded-md border border-hatch-400 bg-paper-100 px-2 py-1 text-xs"
                  >
                    {attachment.filename}
                    <button
                      type="button"
                      aria-label={`Remove ${attachment.filename}`}
                      onClick={() => setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => void handleFiles(event.target.files)}
            />
            <div className="flex flex-wrap items-center gap-2 sm:ml-23">
              <Clock className="size-4 text-hatch-600" />
              <Input
                aria-label="Schedule send time"
                type="datetime-local"
                value={sendAt}
                onChange={(event) => setSendAt(event.target.value)}
                className="min-w-0 flex-1 border-hatch-400 bg-paper-100 text-base sm:max-w-56 sm:text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSending || !sendAt}
                onClick={() => void handleSchedule()}
              >
                Send later
              </Button>
            </div>
            <div className="sticky bottom-0 z-20 -mx-3 -mb-[max(1rem,env(safe-area-inset-bottom))] flex items-center justify-between border-t-2 border-hatch-200 bg-paper-200/95 px-3 pb-[max(.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:static sm:mx-0 sm:mb-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-4">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-ink-600 hover:bg-hatch-200/50"
                disabled={isSending}
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
                Attach
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSending}
                  className="border-hatch-400 hover:bg-hatch-200/50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={isSending}
                  className="gap-2 bg-ink-700 hover:bg-ink-800 text-paper-100 shadow-md"
                >
                  <Send className="h-4 w-4" />
                  {isSending ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
