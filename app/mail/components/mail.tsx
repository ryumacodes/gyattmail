"use client"

import * as React from "react"
import {
  AlertCircle,
  Archive,
  ArchiveX,
  Clock, // Clock icon for Snoozed folder
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

interface MailProps {
  accounts: {
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
  const { toggleStar, addLabel } = useMailActions()
  const [showAddAccountDialog, setShowAddAccountDialog] = React.useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = React.useState(false)
  const [showSettings, setShowSettings] = React.useState(false)
  const [dismissedErrors, setDismissedErrors] = React.useState<Set<string>>(new Set())
  const [retryingAccounts, setRetryingAccounts] = React.useState<Set<string>>(new Set())
  const [activeDragId, setActiveDragId] = React.useState<string | null>(null)

  // Filter mails for inbox view - exclude archived, deleted, and snoozed
  const mails = allMails.filter(m => {
    // Exclude archived and deleted
    if (m.archived || m.deleted) return false

    // Exclude snoozed emails that haven't reached their snooze time
    if (m.snoozeUntil) {
      const snoozeDate = new Date(m.snoozeUntil)
      const now = new Date()
      if (snoozeDate > now) return false
    }

    return true
  })

  // Count snoozed emails (not yet due to reappear)
  const snoozedCount = allMails.filter(m => {
    if (!m.snoozeUntil) return false
    const snoozeDate = new Date(m.snoozeUntil)
    const now = new Date()
    return snoozeDate > now
  }).length

  const failedAccounts = accounts.filter(
    acc => acc.connectionStatus === "failed" && !dismissedErrors.has(acc.email)
  )

  const handleRetry = async (email: string) => {
    setRetryingAccounts(prev => new Set(prev).add(email))

    // TODO: Implement actual IMAP/SMTP reconnection logic here
    // Simulating retry for now
    await new Promise(resolve => setTimeout(resolve, 2000))

    setRetryingAccounts(prev => {
      const next = new Set(prev)
      next.delete(email)
      return next
    })

    // For demo: pretend the retry succeeded
    console.log(`Retried connection for ${email}`)
  }

  const handleDismiss = (email: string) => {
    setDismissedErrors(prev => new Set(prev).add(email))
  }

  const handleClearSelection = () => {
    setMail({ ...mail, selectedIds: new Set(), lastSelectedIndex: null })
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

      // c - Compose (placeholder for now)
      if (e.key === "c") {
        e.preventDefault()
        console.log("Compose new mail - TODO")
        return
      }

      // r - Reply
      if (e.key === "r" && mail.selected) {
        e.preventDefault()
        console.log("Reply - TODO")
        return
      }

      // a - Reply all
      if (e.key === "a" && mail.selected) {
        e.preventDefault()
        console.log("Reply all - TODO")
        return
      }

      // f - Forward
      if (e.key === "f" && mail.selected) {
        e.preventDefault()
        console.log("Forward - TODO")
        return
      }

      // # - Delete
      if (e.key === "#" && mail.selected) {
        e.preventDefault()
        console.log("Delete - TODO")
        return
      }

      // e - Archive
      if (e.key === "e" && mail.selected) {
        e.preventDefault()
        console.log("Archive - TODO")
        return
      }

      // ! - Mark as spam/junk
      if (e.key === "!" && mail.selected) {
        e.preventDefault()
        console.log("Mark as spam - TODO")
        return
      }

      // Shift+i - Mark as read
      if (e.key === "I" && mail.selected) {
        e.preventDefault()
        console.log("Mark as read - TODO")
        return
      }

      // Shift+u - Mark as unread
      if (e.key === "U" && mail.selected) {
        e.preventDefault()
        console.log("Mark as unread - TODO")
        return
      }

      // s - Star/unstar
      if (e.key === "s" && mail.selected) {
        e.preventDefault()
        toggleStar(mail.selected)
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [mail, mails, setMail, toggleStar])

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
            links={[
              {
                title: "Inbox",
                label: "128",
                icon: Inbox,
                variant: "default",
              },
              {
                title: "Starred",
                label: String(mails.filter(m => m.starred).length),
                icon: Star,
                variant: "ghost",
              },
              {
                title: "Drafts",
                label: "9",
                icon: File,
                variant: "ghost",
              },
              {
                title: "Sent",
                label: "",
                icon: Send,
                variant: "ghost",
              },
              {
                title: "Junk",
                label: "23",
                icon: ArchiveX,
                variant: "ghost",
              },
              {
                title: "Trash",
                label: "",
                icon: Trash2,
                variant: "ghost",
              },
              {
                title: "Archive",
                label: "",
                icon: Archive,
                variant: "ghost",
              },
              {
                title: "Snoozed",
                label: String(snoozedCount),
                icon: Clock,
                variant: "ghost",
              },
            ]}
          />
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Social",
                label: "972",
                icon: Users2,
                variant: "ghost",
              },
              {
                title: "Updates",
                label: "342",
                icon: AlertCircle,
                variant: "ghost",
              },
              {
                title: "Forums",
                label: "128",
                icon: MessagesSquare,
                variant: "ghost",
              },
              {
                title: "Shopping",
                label: "8",
                icon: ShoppingCart,
                variant: "ghost",
              },
              {
                title: "Promotions",
                label: "21",
                icon: Archive,
                variant: "ghost",
              },
            ]}
          />
          <Separator />
          <LabelNav isCollapsed={isCollapsed} mails={mails} />
        </ResizablePanel>
        <ResizableHandle withHandle className="hidden md:flex" />
        <ResizablePanel
          defaultSize={defaultLayout[1]}
          minSize={25}
          maxSize={45}
          className={cn(
            "bg-background",
            // On mobile: hide when mail is selected, show when no mail selected
            // On desktop: always show
            mail.selected ? "hidden md:block" : "block"
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
                  onClick={() => setShowSettings(true)}
                  className="ml-3 p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Settings"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
              <Separator />
              {/* Connection Error Banners */}
              {failedAccounts.map((account) => (
                <ConnectionErrorBanner
                  key={account.email}
                  accountLabel={account.label}
                  accountEmail={account.email}
                  error={account.lastError || "Connection failed"}
                  onRetry={() => handleRetry(account.email)}
                  onDismiss={() => handleDismiss(account.email)}
                  isRetrying={retryingAccounts.has(account.email)}
                />
              ))}
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
            <TabsContent value="all" className={cn("m-0 flex-1 overflow-y-auto scrollbar-hide", mail.selectedIds.size > 0 && "pt-2")}>
              <MailList items={mails} />
            </TabsContent>
            <TabsContent value="unread" className={cn("m-0 flex-1 overflow-y-auto scrollbar-hide", mail.selectedIds.size > 0 && "pt-2")}>
              <MailList items={mails.filter((item) => !item.read)} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        {mail.selected && mails.find((item) => item.id === mail.selected) && (
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
                mail={mails.find((item) => item.id === mail.selected)!}
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
      <AddAccountDialog
        open={showAddAccountDialog}
        onOpenChange={setShowAddAccountDialog}
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
