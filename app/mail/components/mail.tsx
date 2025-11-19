"use client"

import * as React from "react"
import {
  AlertCircle,
  Archive,
  ArchiveX,
  Clock, // Clock icon for Snoozed folder
  Edit,
  File,
  Inbox,
  MessagesSquare,
  Search,
  Send,
  Settings,
  ShoppingCart,
  Star,
  Trash2,
  Users2,
} from "lucide-react"
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AccountSwitcher } from "@/app/mail/components/account-switcher"
import { AccountPills } from "@/app/mail/components/account-pills"
import { AddAccountDialog } from "@/app/mail/components/add-account-dialog"
import { ComposeDialog } from "@/app/mail/components/compose-dialog"
import { ConnectionErrorBanner } from "@/app/mail/components/connection-error-banner"
import { KeyboardShortcutsDialog } from "@/app/mail/components/keyboard-shortcuts-dialog"
import { SettingsDialog } from "@/app/mail/components/settings-dialog"
import { MailDisplay } from "@/app/mail/components/mail-display"
import { MailList } from "@/app/mail/components/mail-list"
import { BulkActionBar } from "@/app/mail/components/bulk-action-bar"
import { Nav } from "@/app/mail/components/nav"
import { LabelNav } from "@/app/mail/components/label-nav"
import { type Mail } from "@/app/mail/data"
import { useMail } from "@/app/mail/use-mail"
import { useMailData } from "@/app/mail/use-mail-data"
import { useMailActions } from "@/app/mail/use-mail-actions"
import { useMailSync } from "@/app/mail/use-mail-sync"
import { useBackgroundSync } from "@/app/mail/use-background-sync"
import { useLoadEmails } from "@/app/mail/use-load-emails"

interface MailProps {
  accounts: {
    id: string
    label: string
    email: string
    icon: React.ReactNode
    connectionStatus?: "connected" | "failed" | "reconnecting"
    lastError?: string
  }[]
  defaultLayout: number[] | undefined
  defaultCollapsed?: boolean
  navCollapsedSize: number
}

export function Mail({
  accounts,
  defaultLayout = [15, 30, 55],
  defaultCollapsed = false,
  navCollapsedSize,
}: MailProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [mail, setMail] = useMail()
  const [allMails] = useMailData()
  const { toggleStar, addLabel, markAsRead, markAsUnread, archiveMail, deleteMail } = useMailActions()
  const [showAddAccountDialog, setShowAddAccountDialog] = React.useState(false)
  const [showComposeDialog, setShowComposeDialog] = React.useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = React.useState(false)
  const [showSettings, setShowSettings] = React.useState(false)
  const [dismissedErrors, setDismissedErrors] = React.useState<Set<string>>(new Set())
  const [retryingAccounts, setRetryingAccounts] = React.useState<Set<string>>(new Set())
  const [activeDragId, setActiveDragId] = React.useState<string | null>(null)
  const [currentFolder, setCurrentFolder] = React.useState<string>("inbox")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [currentPageUnread, setCurrentPageUnread] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(15)
  const [composeReplyTo, setComposeReplyTo] = React.useState<{
    to: string
    subject: string
    body: string
    messageId?: string
  } | undefined>(undefined)

  // Load emails from backend storage on mount
  const { isLoading: isLoadingEmails, reload: reloadEmails } = useLoadEmails()

  // Background sync for real-time updates (reloads emails after each sync)
  useBackgroundSync({ reloadEmails })

  // Filter mails based on current folder
  const mails = allMails.filter(m => {
    const now = new Date()
    const isSnoozed = m.snoozeUntil && new Date(m.snoozeUntil) > now

    switch (currentFolder.toLowerCase()) {
      case "inbox":
        // Inbox: exclude archived, deleted, and snoozed
        return !m.archived && !m.deleted && !isSnoozed
      case "starred":
        return m.starred && !m.deleted
      case "drafts":
        return (m.labels.includes("Draft") || m.labels.includes("\\Draft") || m.labels.includes("Drafts")) && !m.deleted
      case "sent":
        return (m.labels.includes("Sent") || m.labels.includes("\\Sent")) && !m.deleted
      case "junk":
        return (m.labels.includes("Junk") || m.labels.includes("Spam")) && !m.deleted
      case "trash":
        return m.deleted
      case "archive":
        return m.archived && !m.deleted
      case "snoozed":
        return isSnoozed
      case "social":
      case "updates":
      case "forums":
      case "shopping":
      case "promotions":
        // Category folders - check for label
        const label = currentFolder.charAt(0).toUpperCase() + currentFolder.slice(1)
        return m.labels.includes(label) && !m.archived && !m.deleted && !isSnoozed
      default:
        // Check if it's a custom label
        const customLabel = currentFolder.charAt(0).toUpperCase() + currentFolder.slice(1)
        if (m.labels.some(l => l.toLowerCase() === currentFolder.toLowerCase())) {
          return !m.archived && !m.deleted && !isSnoozed
        }
        // Default to inbox view
        return !m.archived && !m.deleted && !isSnoozed
    }
  })

  // Pagination logic for "All" tab
  const totalMails = mails.length
  const totalPages = Math.ceil(totalMails / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedMails = mails.slice(startIndex, endIndex)

  // Pagination logic for "Unread" tab
  const unreadMails = mails.filter((item) => !item.read)
  const totalUnreadMails = unreadMails.length
  const totalUnreadPages = Math.ceil(totalUnreadMails / itemsPerPage)
  const startIndexUnread = (currentPageUnread - 1) * itemsPerPage
  const endIndexUnread = startIndexUnread + itemsPerPage
  const paginatedUnreadMails = unreadMails.slice(startIndexUnread, endIndexUnread)

  // Reset to page 1 when folder changes
  React.useEffect(() => {
    setCurrentPage(1)
    setCurrentPageUnread(1)
  }, [currentFolder])

  // Count snoozed emails (not yet due to reappear) - unread only
  const snoozedCount = allMails.filter(m => {
    if (!m.snoozeUntil || m.read) return false
    const snoozeDate = new Date(m.snoozeUntil)
    const now = new Date()
    return snoozeDate > now
  }).length

  const failedAccounts = accounts.filter(
    acc => acc.connectionStatus === "failed" && !dismissedErrors.has(acc.email)
  )

  const handleRetry = async (email: string) => {
    setRetryingAccounts(prev => new Set(prev).add(email))

    const account = accounts.find(acc => acc.email === email)
    if (!account) {
      setRetryingAccounts(prev => {
        const next = new Set(prev)
        next.delete(email)
        return next
      })
      return
    }

    // Check if it's an OAuth error that requires re-authentication
    const isOAuthError = account.lastError?.includes('invalid_grant') ||
                         account.lastError?.includes('authentication') ||
                         account.lastError?.includes('unauthorized')

    if (isOAuthError) {
      // Delete the account with invalid token
      try {
        await fetch('/api/accounts/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
      } catch (error) {
        console.error('Failed to delete account:', error)
      }

      // Redirect to connect page to re-authenticate
      window.location.href = '/connect'
    } else {
      // For non-OAuth errors, try to reconnect with exponential backoff
      let retrySuccess = false
      const maxRetries = 3

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          // Wait with exponential backoff: 2s, 4s, 8s
          const backoffDelay = 2000 * Math.pow(2, attempt)
          await new Promise(resolve => setTimeout(resolve, backoffDelay))

          // Try to sync emails to test connection
          const response = await fetch('/api/mail/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountEmail: email })
          })

          if (response.ok) {
            console.log(`Successfully reconnected ${email} on attempt ${attempt + 1}`)
            retrySuccess = true
            break
          }
        } catch (error) {
          console.error(`Retry attempt ${attempt + 1} failed for ${email}:`, error)
        }
      }

      setRetryingAccounts(prev => {
        const next = new Set(prev)
        next.delete(email)
        return next
      })

      if (retrySuccess) {
        console.log(`Retried connection for ${email} successfully`)
        // Refresh the page to reload accounts
        window.location.reload()
      } else {
        console.error(`Failed to reconnect ${email} after ${maxRetries} attempts`)
      }
    }
  }

  const handleDismiss = (email: string) => {
    setDismissedErrors(prev => new Set(prev).add(email))
  }

  const handleClearSelection = () => {
    setMail({ ...mail, selectedIds: new Set(), lastSelectedIndex: null })
  }

  const handleReply = (selectedMail: Mail, prefilledBody?: string) => {
    const replySubject = selectedMail.subject.startsWith("Re:")
      ? selectedMail.subject
      : `Re: ${selectedMail.subject}`

    const quotedBody = `\n\n> ${selectedMail.text.split("\n").join("\n> ")}`
    const finalBody = prefilledBody || quotedBody

    setComposeReplyTo({
      from: selectedMail.email,
      subject: replySubject,
      body: finalBody,
      messageId: selectedMail.id,
    })
    setShowComposeDialog(true)
  }

  const handleReplyAll = (selectedMail: Mail) => {
    const replySubject = selectedMail.subject.startsWith("Re:")
      ? selectedMail.subject
      : `Re: ${selectedMail.subject}`

    // Get all recipients (to + cc) excluding our own email
    const allRecipients = [
      selectedMail.email,
      ...(selectedMail.participants || [])
        .map(p => p.email)
        .filter(email => email !== selectedMail.email) // Exclude sender duplicates
    ].join(", ")

    const quotedBody = `\n\n> ${selectedMail.text.split("\n").join("\n> ")}`

    setComposeReplyTo({
      from: allRecipients,
      subject: replySubject,
      body: quotedBody,
      messageId: selectedMail.id,
    })
    setShowComposeDialog(true)
  }

  const handleForward = (selectedMail: Mail) => {
    const forwardSubject = selectedMail.subject.startsWith("Fwd:")
      ? selectedMail.subject
      : `Fwd: ${selectedMail.subject}`

    const forwardedBody = `\n\n---------- Forwarded message ---------\nFrom: ${selectedMail.name} <${selectedMail.email}>\nDate: ${selectedMail.date}\nSubject: ${selectedMail.subject}\n\n${selectedMail.text}`

    setComposeReplyTo({
      from: "",
      subject: forwardSubject,
      body: forwardedBody,
      messageId: selectedMail.id,
    })
    setShowComposeDialog(true)
  }

  // Load fontSize from localStorage on mount
  React.useEffect(() => {
    const savedFontSize = localStorage.getItem("gyattmail-fontSize")
    if (savedFontSize) {
      setMail({ ...mail, fontSize: parseInt(savedFontSize, 10) })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDragId(null)

    if (over && over.id) {
      const mailId = active.id as string
      const label = over.id as string

      // Add label to the dragged mail
      addLabel(mailId, label)
    }
  }

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return
      }

      const currentMailIndex = mails.findIndex(m => m.id === mail.selected)

      // Ctrl+/ or Cmd+/ to toggle shortcuts
      if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setShowKeyboardShortcuts(prev => !prev)
        return
      }

      // / - Focus search
      if (e.key === "/") {
        e.preventDefault()
        const searchInput = document.querySelector('input[placeholder="Search mail..."]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
        return
      }

      // Arrow Up - Previous mail
      if (e.key === "ArrowUp") {
        e.preventDefault()
        if (currentMailIndex > 0) {
          setMail({ ...mail, selected: mails[currentMailIndex - 1].id })
        }
        return
      }

      // Arrow Down - Next mail
      if (e.key === "ArrowDown") {
        e.preventDefault()
        if (currentMailIndex < mails.length - 1) {
          setMail({ ...mail, selected: mails[currentMailIndex + 1].id })
        }
        return
      }

      // Enter - Open/select mail (if none selected, select first)
      if (e.key === "Enter") {
        e.preventDefault()
        if (!mail.selected && mails.length > 0) {
          setMail({ ...mail, selected: mails[0].id })
        }
        return
      }

      // Escape - Close mail (deselect)
      if (e.key === "Escape") {
        e.preventDefault()
        if (mail.selected) {
          setMail({ ...mail, selected: null })
        }
        return
      }

      // c - Compose
      if (e.key === "c") {
        e.preventDefault()
        setShowComposeDialog(true)
        return
      }

      // r - Reply
      if (e.key === "r" && mail.selected) {
        e.preventDefault()
        const selectedMail = allMails.find(m => m.id === mail.selected)
        if (selectedMail) {
          handleReply(selectedMail)
        }
        return
      }

      // a - Reply all
      if (e.key === "a" && mail.selected) {
        e.preventDefault()
        const selectedMail = allMails.find(m => m.id === mail.selected)
        if (selectedMail) {
          handleReplyAll(selectedMail)
        }
        return
      }

      // f - Forward
      if (e.key === "f" && mail.selected) {
        e.preventDefault()
        const selectedMail = allMails.find(m => m.id === mail.selected)
        if (selectedMail) {
          handleForward(selectedMail)
        }
        return
      }

      // # - Delete
      if (e.key === "#" && mail.selected) {
        e.preventDefault()
        deleteMail(mail.selected)
        setMail({ ...mail, selected: null })
        return
      }

      // e - Archive
      if (e.key === "e" && mail.selected) {
        e.preventDefault()
        archiveMail(mail.selected)
        setMail({ ...mail, selected: null })
        return
      }

      // ! - Mark as spam/junk
      if (e.key === "!" && mail.selected) {
        e.preventDefault()
        addLabel(mail.selected, "Junk")
        archiveMail(mail.selected)
        setMail({ ...mail, selected: null })
        return
      }

      // Shift+i - Mark as read
      if (e.key === "I" && mail.selected) {
        e.preventDefault()
        markAsRead(mail.selected)
        return
      }

      // Shift+u - Mark as unread
      if (e.key === "U" && mail.selected) {
        e.preventDefault()
        markAsUnread(mail.selected)
        return
      }

      // s - Star/unstar
      if (e.key === "s" && mail.selected) {
        e.preventDefault()
        toggleStar(mail.selected)
        return
      }

      // v - Toggle focus mode (hide/show mail list when viewing email)
      if (e.key === "v") {
        e.preventDefault()
        setMail({ ...mail, focusMode: !mail.focusMode })
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [mail, mails, allMails, setMail, toggleStar, handleReply, handleReplyAll, handleForward, markAsRead, markAsUnread, archiveMail, deleteMail, addLabel])

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <TooltipProvider delayDuration={0}>
        <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(
            sizes
          )}`
        }}
        className="h-full items-stretch bg-background paper-grain"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={false}
          minSize={12}
          maxSize={18}
          className={cn(
            "bg-background paper-grain",
            "hidden md:block" // Hide sidebar on mobile
          )}
        >
          <div className="flex items-center px-4 h-14">
            <AccountSwitcher isCollapsed={isCollapsed} accounts={accounts} />
          </div>
          <Separator />
          <AccountPills
            isCollapsed={isCollapsed}
            accounts={accounts}
            mails={mails}
            onAddAccount={() => setShowAddAccountDialog(true)}
          />
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            currentFolder={currentFolder}
            onFolderChange={setCurrentFolder}
            links={[
              {
                title: "Inbox",
                label: String(allMails.filter(m => !m.archived && !m.deleted && !(m.snoozeUntil && new Date(m.snoozeUntil) > new Date()) && !m.read).length),
                icon: Inbox,
                folder: "inbox",
                variant: "default" as const,
              },
              {
                title: "Starred",
                label: String(allMails.filter(m => m.starred && !m.deleted).length),
                icon: Star,
                folder: "starred",
                variant: "default" as const,
              },
              {
                title: "Drafts",
                label: "0",
                icon: File,
                folder: "drafts",
                variant: "default" as const,
              },
              {
                title: "Sent",
                label: "",
                icon: Send,
                folder: "sent",
                variant: "default" as const,
              },
              {
                title: "Junk",
                label: String(allMails.filter(m => (m.labels.includes("Junk") || m.labels.includes("Spam")) && !m.read).length),
                icon: ArchiveX,
                folder: "junk",
                variant: "default" as const,
              },
              {
                title: "Trash",
                label: String(allMails.filter(m => m.deleted && !m.read).length),
                icon: Trash2,
                folder: "trash",
                variant: "default" as const,
              },
              {
                title: "Archive",
                label: String(allMails.filter(m => m.archived && !m.deleted && !m.read).length),
                icon: Archive,
                folder: "archive",
                variant: "default" as const,
              },
              {
                title: "Snoozed",
                label: String(snoozedCount),
                icon: Clock,
                variant: "default" as const,
                folder: "snoozed",
              },
            ]}
          />
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            currentFolder={currentFolder}
            onFolderChange={setCurrentFolder}
            links={[
              {
                title: "Social",
                label: String(allMails.filter(m => m.labels.includes("Social") && !m.archived && !m.deleted && !m.read).length),
                icon: Users2,
                folder: "social",
                variant: "ghost" as const,
              },
              {
                title: "Updates",
                label: String(allMails.filter(m => m.labels.includes("Updates") && !m.archived && !m.deleted && !m.read).length),
                icon: AlertCircle,
                folder: "updates",
                variant: "ghost" as const,
              },
              {
                title: "Forums",
                label: String(allMails.filter(m => m.labels.includes("Forums") && !m.archived && !m.deleted && !m.read).length),
                icon: MessagesSquare,
                folder: "forums",
                variant: "ghost" as const,
              },
              {
                title: "Shopping",
                label: String(allMails.filter(m => m.labels.includes("Shopping") && !m.archived && !m.deleted && !m.read).length),
                icon: ShoppingCart,
                folder: "shopping",
                variant: "ghost" as const,
              },
              {
                title: "Promotions",
                label: String(allMails.filter(m => m.labels.includes("Promotions") && !m.archived && !m.deleted && !m.read).length),
                icon: Archive,
                folder: "promotions",
                variant: "ghost" as const,
              },
            ]}
          />
          <Separator />
          <LabelNav
            isCollapsed={isCollapsed}
            mails={allMails}
            onLabelClick={(label) => {
              setCurrentFolder(label.toLowerCase())
            }}
          />
        </ResizablePanel>
        <ResizableHandle withHandle className="hidden md:flex" />
        <ResizablePanel
          defaultSize={defaultLayout[1]}
          minSize={25}
          maxSize={45}
          className={cn(
            "bg-background",
            // On mobile: hide when mail is selected, show when no mail selected
            // On desktop: show unless focus mode is enabled
            mail.selected ? "hidden md:block" : "block",
            mail.focusMode && mail.selected && "hidden"
          )}
        >
          <Tabs defaultValue="all" className="h-full flex flex-col">
            <div className="flex-shrink-0">
              <div className="flex items-center px-4 h-14">
                <h1 className="text-xl font-serif font-bold text-foreground">Inbox</h1>
                <TabsList className="ml-auto">
                  <TabsTrigger value="all">
                    All mail
                  </TabsTrigger>
                  <TabsTrigger value="unread">
                    Unread
                  </TabsTrigger>
                </TabsList>
                <button
                  onClick={() => setShowComposeDialog(true)}
                  className="ml-3 p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                  aria-label="Compose"
                  title="Compose new message (C)"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="ml-2 p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Settings"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
              <Separator />
              {/* Connection Error Banners */}
              {failedAccounts.map((account) => {
                const isOAuthError = account.lastError?.includes('invalid_grant') ||
                                     account.lastError?.includes('authentication') ||
                                     account.lastError?.includes('unauthorized')
                return (
                  <ConnectionErrorBanner
                    key={account.email}
                    accountLabel={account.label}
                    accountEmail={account.email}
                    error={account.lastError || "Connection failed"}
                    onRetry={() => handleRetry(account.email)}
                    onDismiss={() => handleDismiss(account.email)}
                    isRetrying={retryingAccounts.has(account.email)}
                    isOAuthError={isOAuthError}
                  />
                )
              })}
              <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <form>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search mail..." className="pl-8" />
                  </div>
                </form>
              </div>
              <BulkActionBar
                selectedIds={mail.selectedIds}
                onClearSelection={handleClearSelection}
                totalCount={mails.length}
              />
            </div>
            <TabsContent value="all" className={cn("m-0 flex-1 overflow-hidden flex flex-col data-[state=inactive]:hidden", mail.selectedIds.size > 0 && "pt-2")}>
              <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
                <MailList items={paginatedMails} onReply={handleReply} />
              </div>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-t bg-background">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(endIndex, totalMails)} of {totalMails} emails
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="unread" className={cn("m-0 flex-1 overflow-hidden flex flex-col data-[state=inactive]:hidden", mail.selectedIds.size > 0 && "pt-2")}>
              <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
                <MailList items={paginatedUnreadMails} onReply={handleReply} />
              </div>
              {/* Pagination Controls */}
              {totalUnreadPages > 1 && (
                <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-t bg-background">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndexUnread + 1}-{Math.min(endIndexUnread, totalUnreadMails)} of {totalUnreadMails} unread emails
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageUnread(p => Math.max(1, p - 1))}
                      disabled={currentPageUnread === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm">
                      Page {currentPageUnread} of {totalUnreadPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPageUnread(p => Math.min(totalUnreadPages, p + 1))}
                      disabled={currentPageUnread === totalUnreadPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        {mail.selected && allMails.find((item) => item.id === mail.selected) && (
          <>
            <ResizableHandle withHandle className="hidden md:flex" />
            <ResizablePanel
              defaultSize={defaultLayout[2]}
              minSize={35}
              maxSize={70}
              className={cn(
                "bg-background paper-grain",
                // On mobile: show full width when selected
                // On desktop: show in resizable panel
                "block"
              )}
            >
              <MailDisplay
                mail={allMails.find((item) => item.id === mail.selected)!}
                onReply={handleReply}
                onReplyAll={handleReplyAll}
                onForward={handleForward}
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
      <AddAccountDialog
        open={showAddAccountDialog}
        onOpenChange={setShowAddAccountDialog}
      />
      <ComposeDialog
        open={showComposeDialog}
        onOpenChange={(open) => {
          setShowComposeDialog(open)
          if (!open) {
            // Clear reply data when dialog closes
            setComposeReplyTo(undefined)
          }
        }}
        accounts={accounts.map(acc => ({
          id: acc.id,
          email: acc.email,
          label: acc.label,
        }))}
        defaultAccount={accounts[0]?.id}
        replyTo={composeReplyTo}
      />
      <KeyboardShortcutsDialog
        open={showKeyboardShortcuts}
        onOpenChange={setShowKeyboardShortcuts}
      />
      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />
      </TooltipProvider>
    </DndContext>
  )
}
