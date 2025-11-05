import { useMailData } from "./use-mail-data"
import { toast } from "sonner"

export function useMailActions() {
  const [mails, setMails] = useMailData()

  const markAsRead = (mailId: string) => {
    const previousMail = mails.find(m => m.id === mailId)
    if (!previousMail) return

    setMails(mails.map(mail =>
      mail.id === mailId ? { ...mail, read: true } : mail
    ))

    const undo = () => {
      setMails(mails.map(mail =>
        mail.id === mailId ? { ...mail, read: previousMail.read } : mail
      ))
    }

    toast.success("Marked as read", {
      action: {
        label: "Undo",
        onClick: undo,
      },
      duration: 5000,
    })
  }

  const markAsUnread = (mailId: string) => {
    const previousMail = mails.find(m => m.id === mailId)
    if (!previousMail) return

    setMails(mails.map(mail =>
      mail.id === mailId ? { ...mail, read: false } : mail
    ))

    const undo = () => {
      setMails(mails.map(mail =>
        mail.id === mailId ? { ...mail, read: previousMail.read } : mail
      ))
    }

    toast.success("Marked as unread", {
      action: {
        label: "Undo",
        onClick: undo,
      },
      duration: 5000,
    })
  }

  const toggleRead = (mailId: string) => {
    const mail = mails.find(m => m.id === mailId)
    if (mail) {
      if (mail.read) {
        markAsUnread(mailId)
      } else {
        markAsRead(mailId)
      }
    }
  }

  const archiveMail = (mailId: string) => {
    const previousMail = mails.find(m => m.id === mailId)
    if (!previousMail) return

    setMails(mails.map(mail =>
      mail.id === mailId ? { ...mail, archived: true } : mail
    ))

    const undo = () => {
      setMails(mails.map(mail =>
        mail.id === mailId ? { ...mail, archived: previousMail.archived } : mail
      ))
    }

    toast.success("Archived", {
      action: {
        label: "Undo",
        onClick: undo,
      },
      duration: 5000,
    })
  }

  const deleteMail = (mailId: string) => {
    const previousMail = mails.find(m => m.id === mailId)
    if (!previousMail) return

    setMails(mails.map(mail =>
      mail.id === mailId ? { ...mail, deleted: true } : mail
    ))

    const undo = () => {
      setMails(mails.map(mail =>
        mail.id === mailId ? { ...mail, deleted: previousMail.deleted } : mail
      ))
    }

    toast.success("Moved to trash", {
      action: {
        label: "Undo",
        onClick: undo,
      },
      duration: 5000,
    })
  }

  const addLabel = (mailId: string, label: string) => {
    const previousMail = mails.find(m => m.id === mailId)
    if (!previousMail) return

    setMails(mails.map(mail => {
      if (mail.id === mailId) {
        // Avoid duplicates
        const labels = mail.labels.includes(label)
          ? mail.labels
          : [...mail.labels, label]
        return { ...mail, labels }
      }
      return mail
    }))

    const undo = () => {
      setMails(mails.map(mail =>
        mail.id === mailId ? { ...mail, labels: previousMail.labels } : mail
      ))
    }

    toast.success(`Label "${label}" added`, {
      action: {
        label: "Undo",
        onClick: undo,
      },
      duration: 5000,
    })
  }

  const removeLabel = (mailId: string, label: string) => {
    const previousMail = mails.find(m => m.id === mailId)
    if (!previousMail) return

    setMails(mails.map(mail => {
      if (mail.id === mailId) {
        return { ...mail, labels: mail.labels.filter(l => l !== label) }
      }
      return mail
    }))

    const undo = () => {
      setMails(mails.map(mail =>
        mail.id === mailId ? { ...mail, labels: previousMail.labels } : mail
      ))
    }

    toast.success(`Label "${label}" removed`, {
      action: {
        label: "Undo",
        onClick: undo,
      },
      duration: 5000,
    })
  }

  const toggleStar = (mailId: string) => {
    const previousMail = mails.find(m => m.id === mailId)
    if (!previousMail) return

    const newStarred = !previousMail.starred

    setMails(mails.map(mail =>
      mail.id === mailId ? { ...mail, starred: newStarred } : mail
    ))

    const undo = () => {
      setMails(mails.map(mail =>
        mail.id === mailId ? { ...mail, starred: previousMail.starred } : mail
      ))
    }

    toast.success(newStarred ? "Starred" : "Unstarred", {
      action: {
        label: "Undo",
        onClick: undo,
      },
      duration: 5000,
    })
  }

  const snoozeMail = (mailId: string, snoozeUntil: Date) => {
    const previousMail = mails.find(m => m.id === mailId)
    if (!previousMail) return

    setMails(mails.map(mail =>
      mail.id === mailId
        ? { ...mail, snoozeUntil: snoozeUntil.toISOString(), read: false }
        : mail
    ))

    const undo = () => {
      setMails(mails.map(mail =>
        mail.id === mailId
          ? { ...mail, snoozeUntil: previousMail.snoozeUntil, read: previousMail.read }
          : mail
      ))
    }

    const formatDate = (date: Date) => {
      const now = new Date()
      const diff = date.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const days = Math.floor(hours / 24)

      if (hours < 24) {
        return `later today`
      } else if (days === 1) {
        return `tomorrow`
      } else if (days < 7) {
        return `in ${days} days`
      } else {
        return `next week`
      }
    }

    toast.success(`Snoozed until ${formatDate(snoozeUntil)}`, {
      action: {
        label: "Undo",
        onClick: undo,
      },
      duration: 5000,
    })
  }

  // Bulk actions
  const archiveMultiple = (mailIds: string[]) => {
    const previousMails = mails.filter(m => mailIds.includes(m.id))

    setMails(mails.map(mail =>
      mailIds.includes(mail.id) ? { ...mail, archived: true } : mail
    ))

    const undo = () => {
      setMails(mails.map(mail => {
        const prev = previousMails.find(p => p.id === mail.id)
        return prev ? { ...mail, archived: prev.archived } : mail
      }))
    }

    toast.success(`${mailIds.length} email${mailIds.length > 1 ? 's' : ''} archived`, {
      action: {
        label: "Undo",
        onClick: undo,
      },
      duration: 5000,
    })
  }

  const deleteMultiple = (mailIds: string[]) => {
    const previousMails = mails.filter(m => mailIds.includes(m.id))

    setMails(mails.map(mail =>
      mailIds.includes(mail.id) ? { ...mail, deleted: true } : mail
    ))

    const undo = () => {
      setMails(mails.map(mail => {
        const prev = previousMails.find(p => p.id === mail.id)
        return prev ? { ...mail, deleted: prev.deleted } : mail
      }))
    }

    toast.success(`${mailIds.length} email${mailIds.length > 1 ? 's' : ''} moved to trash`, {
      action: {
        label: "Undo",
        onClick: undo,
      },
      duration: 5000,
    })
  }

  const markMultipleAsRead = (mailIds: string[]) => {
    const previousMails = mails.filter(m => mailIds.includes(m.id))

    setMails(mails.map(mail =>
      mailIds.includes(mail.id) ? { ...mail, read: true } : mail
    ))

    const undo = () => {
      setMails(mails.map(mail => {
        const prev = previousMails.find(p => p.id === mail.id)
        return prev ? { ...mail, read: prev.read } : mail
      }))
    }

    toast.success(`${mailIds.length} email${mailIds.length > 1 ? 's' : ''} marked as read`, {
      action: {
        label: "Undo",
        onClick: undo,
      },
      duration: 5000,
    })
  }

  const markMultipleAsUnread = (mailIds: string[]) => {
    const previousMails = mails.filter(m => mailIds.includes(m.id))

    setMails(mails.map(mail =>
      mailIds.includes(mail.id) ? { ...mail, read: false } : mail
    ))

    const undo = () => {
      setMails(mails.map(mail => {
        const prev = previousMails.find(p => p.id === mail.id)
        return prev ? { ...mail, read: prev.read } : mail
      }))
    }

    toast.success(`${mailIds.length} email${mailIds.length > 1 ? 's' : ''} marked as unread`, {
      action: {
        label: "Undo",
        onClick: undo,
      },
      duration: 5000,
    })
  }

  return {
    markAsRead,
    markAsUnread,
    toggleRead,
    archiveMail,
    deleteMail,
    addLabel,
    removeLabel,
    toggleStar,
    snoozeMail,
    archiveMultiple,
    deleteMultiple,
    markMultipleAsRead,
    markMultipleAsUnread,
  }
}
