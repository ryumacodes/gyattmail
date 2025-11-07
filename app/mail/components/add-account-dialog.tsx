"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface AddAccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddAccountDialog({ open, onOpenChange }: AddAccountDialogProps) {
  const handleProviderConnect = (provider: 'gmail' | 'outlook' | 'custom') => {
    // Redirect to connect page where users can enter credentials
    window.location.href = '/connect'
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

        <div className="space-y-4 py-4">
          <p className="text-sm text-hatch-600">
            To add a new email account, you'll need to provide your OAuth credentials or IMAP/SMTP settings.
          </p>

          {/* OAuth providers */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => handleProviderConnect('gmail')}
            >
              <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
                <title>Gmail</title>
                <path
                  d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
                  fill="currentColor"
                />
              </svg>
              Connect Gmail
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => handleProviderConnect('outlook')}
            >
              <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
                <title>Microsoft Outlook</title>
                <path
                  d="M24 7.386V16.614C24 18.489 22.489 20 20.614 20H3.386C1.511 20 0 18.489 0 16.614V7.386C0 5.511 1.511 4 3.386 4H20.614C22.489 4 24 5.511 24 7.386zM12 13.614L3.386 8.386V16.614L12 13.614zM12 10.386L20.614 5.614H3.386L12 10.386z"
                  fill="currentColor"
                />
              </svg>
              Connect Outlook
            </Button>

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
              variant="outline"
              className="w-full"
              onClick={() => handleProviderConnect('custom')}
            >
              IMAP/SMTP
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
