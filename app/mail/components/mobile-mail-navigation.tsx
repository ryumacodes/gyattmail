"use client"

import {
  Archive,
  ArchiveX,
  Bot,
  Clock,
  Edit,
  File,
  Inbox,
  Mail,
  Plus,
  Search,
  Send,
  Settings,
  Star,
  Trash2,
  UserRound,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Mail as MailItem } from '@/app/mail/data'

interface MobileMailNavigationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentFolder: string
  onFolderChange: (folder: string) => void
  selectedAccount: string
  onAccountChange: (account: string) => void
  accounts: Array<{ id: string; label: string; email: string; ownerKind?: 'human' | 'agent'; icon: React.ReactNode }>
  mails: MailItem[]
  onCompose: () => void
  onSearch: () => void
  onSettings: () => void
  onAddAccount: () => void
}

const folders = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'drafts', label: 'Drafts', icon: File },
  { id: 'sent', label: 'Sent', icon: Send },
  { id: 'archive', label: 'Archive', icon: Archive },
  { id: 'snoozed', label: 'Snoozed', icon: Clock },
  { id: 'junk', label: 'Junk', icon: ArchiveX },
  { id: 'trash', label: 'Trash', icon: Trash2 },
]

export function MobileMailNavigation(props: MobileMailNavigationProps) {
  const chooseFolder = (folder: string) => {
    props.onFolderChange(folder)
    props.onOpenChange(false)
  }
  const chooseAccount = (account: string) => {
    props.onAccountChange(account)
    props.onOpenChange(false)
  }
  const unreadForFolder = (folder: string) => props.mails.filter((mail) => {
    if (mail.read) return false
    if (folder === 'inbox') return !mail.archived && !mail.deleted
    if (folder === 'starred') return mail.starred && !mail.deleted
    if (folder === 'trash') return mail.deleted
    if (folder === 'archive') return mail.archived && !mail.deleted
    if (folder === 'junk') return mail.labels.some((label) => ['junk', 'spam'].includes(label.toLowerCase()))
    return false
  }).length

  return (
    <>
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent className="!left-0 !top-0 !h-dvh !w-[min(88vw,360px)] !max-w-none !translate-x-0 !translate-y-0 content-start gap-0 overflow-y-auto rounded-none border-y-0 border-l-0 bg-background p-0 paper-grain md:hidden">
          <DialogHeader className="hatch-edge-bottom sticky top-0 z-20 bg-background/95 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] text-left backdrop-blur">
            <DialogTitle className="font-serif text-2xl">gyattmail</DialogTitle>
            <p className="text-xs text-muted-foreground">
              Your mail, human and agent, in one place.
            </p>
          </DialogHeader>

          <div className="relative z-10 space-y-6 px-3 py-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
            <section>
              <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Mailboxes
              </p>
              <div className="grid grid-cols-2 gap-2">
                {folders.map(({ id, label, icon: Icon }) => {
                  const count = unreadForFolder(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => chooseFolder(id)}
                      className={cn(
                        'hatch-border flex min-h-12 items-center gap-3 rounded-xl px-3 text-left text-sm transition-colors',
                        props.currentFolder === id
                          ? 'hatch-border-active bg-primary text-primary-foreground shadow-letterpress'
                          : 'bg-card hover:bg-accent'
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate font-medium">{label}</span>
                      {count > 0 && <span className="ml-auto text-xs font-bold">{count}</span>}
                    </button>
                  )
                })}
              </div>
            </section>

            <section>
              <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Account scope
              </p>
              <div className="space-y-1">
                {[
                  { id: 'all', label: 'All mail', icon: Mail },
                  { id: 'human', label: 'Human mail', icon: UserRound },
                  { id: 'agent', label: 'Agent mail', icon: Bot },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => chooseAccount(id)}
                    className={cn(
                      'flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-sm',
                      props.selectedAccount === id ? 'bg-accent font-semibold' : 'hover:bg-card'
                    )}
                  >
                    <Icon className="size-5" />
                    {label}
                  </button>
                ))}
                {props.accounts.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => chooseAccount(account.id)}
                    className={cn(
                      'flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left',
                      props.selectedAccount === account.id ? 'bg-accent' : 'hover:bg-card'
                    )}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center [&_svg]:size-5">
                      {account.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{account.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">{account.email}</span>
                    </span>
                    {account.ownerKind === 'agent' && <Bot className="ml-auto size-4 text-primary" />}
                  </button>
                ))}
              </div>
            </section>

            <Button
              variant="outline"
              className="min-h-12 w-full justify-start gap-3"
              onClick={() => {
                props.onOpenChange(false)
                props.onAddAccount()
              }}
            >
              <Plus className="size-5" />
              Connect another account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <nav aria-label="Mobile mail navigation" className="hatch-edge-top fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <button
          type="button"
          onClick={() => chooseFolder('inbox')}
          className={cn(
            'flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px]',
            props.currentFolder === 'inbox' && 'text-primary'
          )}
        >
          <Inbox className="size-5" />
          Inbox
        </button>
        <button type="button" onClick={props.onSearch} className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px]">
          <Search className="size-5" />
          Search
        </button>
        <button
          type="button"
          onClick={props.onCompose}
          className="hatch-border hatch-border-active mx-auto -mt-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg"
          aria-label="Compose"
        >
          <Edit className="size-6" />
        </button>
        <button
          type="button"
          onClick={() => props.onOpenChange(true)}
          className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px]"
        >
          <Mail className="size-5" />
          Mailboxes
        </button>
        <button type="button" onClick={props.onSettings} className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px]">
          <Settings className="size-5" />
          Settings
        </button>
      </nav>
    </>
  )
}
