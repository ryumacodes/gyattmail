import { useCallback } from 'react'
import { toast } from 'sonner'
import type { MailMutationAction, MailMutationRequest } from '@/lib/types/email'
import type { Mail } from './data'
import { useMailData } from './use-mail-data'

type Patch = (mail: Mail) => Mail

export function useMailActions() {
  const [mails, setMails] = useMailData()
  const expandIds = (ids: string[]) => [...new Set(ids.flatMap((id) => mails.find((mail) => mail.id === id)?.messageIds || [id]))]

  const persist = useCallback(async (request: MailMutationRequest) => {
    const response = await fetch('/api/mail/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    const result = await response.json()
    if (!response.ok || result.success === false) {
      throw new Error(result.failures?.[0]?.error || result.error || 'Mail update failed')
    }
  }, [])

  const mutate = useCallback(async ({ emailIds, action, patch, success, undoAction, undoPatch, ...payload }:
    MailMutationRequest & { patch: Patch; success: string; undoAction?: MailMutationAction; undoPatch?: Patch }) => {
    const ids = new Set(emailIds)
    const before = new Map(mails.filter((mail) => ids.has(mail.id)).map((mail) => [mail.id, mail]))
    setMails((current) => current.map((mail) => ids.has(mail.id) ? patch(mail) : mail))
    try {
      await persist({ emailIds, action, ...payload })
    } catch (error) {
      setMails((current) => current.map((mail) => before.get(mail.id) || mail))
      toast.error(error instanceof Error ? error.message : 'Mail update failed')
      return
    }
    toast.success(success, undoAction ? {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: async () => {
          const restore = undoPatch || ((mail: Mail) => before.get(mail.id) || mail)
          setMails((current) => current.map((mail) => ids.has(mail.id) ? restore(mail) : mail))
          try {
            await persist({ emailIds, action: undoAction })
          } catch (error) {
            setMails((current) => current.map((mail) => ids.has(mail.id) ? patch(mail) : mail))
            toast.error(error instanceof Error ? error.message : 'Unable to undo')
          }
        },
      },
    } : undefined)
  }, [mails, persist, setMails])

  const mark = (requestedIds: string[], read: boolean) => {
    const emailIds = expandIds(requestedIds)
    return mutate({
      emailIds,
      action: read ? 'read' : 'unread',
      patch: (mail) => ({ ...mail, read }),
      success: `${emailIds.length > 1 ? `${emailIds.length} messages` : 'Message'} marked as ${read ? 'read' : 'unread'}`,
      undoAction: read ? 'unread' : 'read',
      undoPatch: (mail) => ({ ...mail, read: !read }),
    })
  }

  const archive = (requestedIds: string[]) => {
    const emailIds = expandIds(requestedIds)
    return mutate({
      emailIds,
      action: 'archive',
      patch: (mail) => ({ ...mail, archived: true, deleted: false }),
      success: `${emailIds.length > 1 ? `${emailIds.length} messages` : 'Message'} archived`,
      undoAction: 'restore',
      undoPatch: (mail) => ({ ...mail, archived: false, deleted: false }),
    })
  }

  const trash = (requestedIds: string[]) => {
    const emailIds = expandIds(requestedIds)
    return mutate({
      emailIds,
      action: 'trash',
      patch: (mail) => ({ ...mail, deleted: true }),
      success: `${emailIds.length > 1 ? `${emailIds.length} messages` : 'Message'} moved to trash`,
      undoAction: 'restore',
      undoPatch: (mail) => ({ ...mail, deleted: false, archived: false }),
    })
  }

  const spam = (requestedIds: string[]) => {
    const emailIds = expandIds(requestedIds)
    return mutate({
      emailIds,
      action: 'spam',
      patch: (mail) => ({
        ...mail,
        labels: [...new Set([...mail.labels, 'Spam'])],
        archived: false,
      }),
      success: `${emailIds.length > 1 ? `${emailIds.length} messages` : 'Message'} moved to spam`,
      undoAction: 'restore',
      undoPatch: (mail) => ({
        ...mail,
        labels: mail.labels.filter((label) => label !== 'Spam'),
      }),
    })
  }

  const permanentlyDelete = async (requestedIds: string[]) => {
    const emailIds = expandIds(requestedIds)
    const idSet = new Set(requestedIds)
    const before = mails
    setMails((current) => current.filter((mail) => !idSet.has(mail.id)))
    try {
      await persist({ emailIds, action: 'delete-permanently' })
      toast.success('Permanently deleted')
    } catch (error) {
      setMails(before)
      toast.error(error instanceof Error ? error.message : 'Delete failed')
    }
  }

  const toggleRead = (mailId: string) => {
    const mail = mails.find((item) => item.id === mailId)
    if (mail) void mark([mailId], !mail.read)
  }

  const toggleStar = (mailId: string) => {
    const mail = mails.find((item) => item.id === mailId)
    if (!mail) return
    const starred = !mail.starred
    void mutate({
      emailIds: expandIds([mailId]),
      action: starred ? 'star' : 'unstar',
      patch: (item) => ({ ...item, starred }),
      success: starred ? 'Starred' : 'Unstarred',
      undoAction: starred ? 'unstar' : 'star',
      undoPatch: (item) => ({ ...item, starred: !starred }),
    })
  }

  const updateLabel = (mailId: string, label: string, add: boolean) => void mutate({
    emailIds: [mailId],
    action: 'labels',
    addLabels: add ? [label] : [],
    removeLabels: add ? [] : [label],
    patch: (mail) => ({ ...mail, labels: add ? [...new Set([...mail.labels, label])] : mail.labels.filter((item) => item !== label) }),
    success: `Label “${label}” ${add ? 'added' : 'removed'}`,
  })

  const snoozeMail = (mailId: string, snoozeUntil: Date) => void mutate({
    emailIds: [mailId],
    action: 'snooze',
    snoozeUntil: snoozeUntil.toISOString(),
    patch: (mail) => ({ ...mail, snoozeUntil: snoozeUntil.toISOString(), read: false }),
    success: `Snoozed until ${snoozeUntil.toLocaleString()}`,
  })

  return {
    markAsRead: (mailId: string) => void mark([mailId], true),
    markAsUnread: (mailId: string) => void mark([mailId], false),
    toggleRead,
    archiveMail: (mailId: string) => void archive([mailId]),
    deleteMail: (mailId: string) => {
      const item = mails.find((mail) => mail.id === mailId)
      void (item?.deleted ? permanentlyDelete([mailId]) : trash([mailId]))
    },
    spamMail: (mailId: string) => void spam([mailId]),
    restoreMail: (mailId: string) => void mutate({
      emailIds: expandIds([mailId]),
      action: 'restore',
      patch: (item) => ({
        ...item,
        deleted: false,
        archived: false,
        labels: item.labels.filter((label) => !['Spam', 'Junk'].includes(label)),
      }),
      success: 'Restored to inbox',
    }),
    addLabel: (mailId: string, label: string) => updateLabel(mailId, label, true),
    removeLabel: (mailId: string, label: string) => updateLabel(mailId, label, false),
    toggleStar,
    snoozeMail,
    archiveMultiple: (mailIds: string[]) => void archive(mailIds),
    deleteMultiple: (mailIds: string[]) => {
      const isTrash = mailIds.every((id) => mails.find((mail) => mail.id === id)?.deleted)
      void (isTrash ? permanentlyDelete(mailIds) : trash(mailIds))
    },
    markMultipleAsRead: (mailIds: string[]) => void mark(mailIds, true),
    markMultipleAsUnread: (mailIds: string[]) => void mark(mailIds, false),
  }
}
