"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
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
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface AddAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddAccountDialog({ open, onOpenChange }: AddAccountDialogProps) {
  const [showManual, setShowManual] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleGmailOAuth = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get OAuth URL from our API
      const response = await fetch('/api/auth/gmail')
      const data = await response.json()

      if (!data.success || !data.authUrl) {
        throw new Error(data.error || 'Failed to initiate Gmail authentication')
      }

      // Open OAuth popup
      const width = 600
      const height = 700
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2

      const popup = window.open(
        data.authUrl,
        'Gmail OAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      )

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.')
      }

      // Close dialog and refresh page after OAuth
      onOpenChange(false)

      // Listen for callback completion
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup)
          // Refresh page to load new account
          window.location.reload()
        }
      }, 500)
    } catch (err) {
      console.error('Gmail OAuth error:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect Gmail')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOutlookOAuth = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get OAuth URL from our API
      const response = await fetch('/api/auth/outlook')
      const data = await response.json()

      if (!data.success || !data.authUrl) {
        throw new Error(data.error || 'Failed to initiate Outlook authentication')
      }

      // Open OAuth popup
      const width = 600
      const height = 700
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2

      const popup = window.open(
        data.authUrl,
        'Outlook OAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      )

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.')
      }

      // Close dialog and refresh page after OAuth
      onOpenChange(false)

      // Listen for callback completion
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup)
          // Refresh page to load new account
          window.location.reload()
        }
      }, 500)
    } catch (err) {
      console.error('Outlook OAuth error:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect Outlook')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-paper-200 border-2 border-hatch-600 paper-grain">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-serif font-bold text-ink-700">
            Connect Email Account
          </DialogTitle>
          <DialogDescription className="text-sm text-ink-700">
            Connect your email account to get started with gyattmail
          </DialogDescription>
        </DialogHeader>

        {!showManual ? (
          <div className="space-y-4 py-4">
            {/* Error display */}
            {error && (
              <div className="rounded-lg bg-red-50 border-2 border-red-200 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {/* OAuth providers */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12"
                onClick={handleGmailOAuth}
                disabled={isLoading}
              >
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
                  <title>Gmail</title>
                  <path
                    d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
                    fill="currentColor"
                  />
                </svg>
                {isLoading ? 'Connecting...' : 'Continue with Gmail'}
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12"
                onClick={handleOutlookOAuth}
                disabled={isLoading}
              >
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
                  <title>Microsoft Outlook</title>
                  <path
                    d="M24 7.386V16.614C24 18.489 22.489 20 20.614 20H3.386C1.511 20 0 18.489 0 16.614V7.386C0 5.511 1.511 4 3.386 4H20.614C22.489 4 24 5.511 24 7.386zM12 13.614L3.386 8.386V16.614L12 13.614zM12 10.386L20.614 5.614H3.386L12 10.386z"
                    fill="currentColor"
                  />
                </svg>
                {isLoading ? 'Connecting...' : 'Continue with Outlook'}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-paper-200 px-2 text-hatch-600">
                  or use
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setShowManual(true)}
            >
              IMAP/SMTP
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <p className="text-sm text-hatch-600">
              For iCloud, Yahoo, custom domains, or any other email provider.
            </p>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="imap-server">IMAP Server</Label>
                <Input id="imap-server" placeholder="imap.example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imap-port">Port</Label>
                <Input id="imap-port" type="number" placeholder="993" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-server">SMTP Server</Label>
                <Input id="smtp-server" placeholder="smtp.example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">Port</Label>
                <Input id="smtp-port" type="number" placeholder="587" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setShowManual(false)}
            >
              Back to OAuth options
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              // TODO: Implement account connection
              console.log("Connect account")
              onOpenChange(false)
            }}
          >
            Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
