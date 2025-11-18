"use client"

import * as React from "react"
import { Paperclip, Send, Minimize2, Maximize2 } from "lucide-react"
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
          text: body,
          inReplyTo: replyTo?.messageId,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to send email")
      }

      toast.success("Email sent successfully!")
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
      <DialogContent className="sm:max-w-[700px] p-0 gap-0 bg-paper-200 border-hatched paper-grain">
        <DialogHeader className="px-4 py-3 pr-12 border-b-2 border-hatch-600 flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-xl font-serif font-bold text-ink-700">
            {replyTo ? "Reply" : "New Message"}
          </DialogTitle>
          <div className="flex items-center gap-1 mr-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-hatch-200/50"
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
          <div className="flex flex-col gap-4 p-6">
            {/* Account Selector (if multiple accounts) */}
            {accounts.length > 1 && (
              <div className="flex items-center gap-3">
                <Label htmlFor="from" className="w-20 text-right text-sm font-medium text-ink-600">
                  From:
                </Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="flex-1 border-hatch-400 bg-paper-100">
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
            <div className="flex items-center gap-3">
              <Label htmlFor="to" className="w-20 text-right text-sm font-medium text-ink-600">
                To:
              </Label>
              <div className="flex-1 flex items-center gap-2">
                <Input
                  id="to"
                  placeholder="Recipients (comma separated)"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="flex-1 border-hatch-400 bg-paper-100 focus:border-hatch-600"
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
              <div className="flex items-center gap-3">
                <Label htmlFor="cc" className="w-20 text-right text-sm font-medium text-ink-600">
                  Cc:
                </Label>
                <Input
                  id="cc"
                  placeholder="Carbon copy (comma separated)"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  className="flex-1 border-hatch-400 bg-paper-100 focus:border-hatch-600"
                />
              </div>
            )}

            {/* Bcc Field */}
            {showBcc && (
              <div className="flex items-center gap-3">
                <Label htmlFor="bcc" className="w-20 text-right text-sm font-medium text-ink-600">
                  Bcc:
                </Label>
                <Input
                  id="bcc"
                  placeholder="Blind carbon copy (comma separated)"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  className="flex-1 border-hatch-400 bg-paper-100 focus:border-hatch-600"
                />
              </div>
            )}

            {/* Subject Field */}
            <div className="flex items-center gap-3">
              <Label htmlFor="subject" className="w-20 text-right text-sm font-medium text-ink-600">
                Subject:
              </Label>
              <Input
                id="subject"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1 border-hatch-400 bg-paper-100 focus:border-hatch-600"
              />
            </div>

            {/* Body Field */}
            <div className="flex gap-3">
              <Label htmlFor="body" className="w-20 text-right text-sm font-medium text-ink-600 pt-2">
                Message:
              </Label>
              <Textarea
                id="body"
                placeholder="Write your message..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="flex-1 min-h-[240px] resize-y border-hatch-400 bg-paper-100 focus:border-hatch-600 font-mono text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-hatch-200">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-ink-600 hover:bg-hatch-200/50"
                disabled={isSending}
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
