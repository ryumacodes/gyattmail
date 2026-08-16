import { EmailMessage } from '@/lib/types/email'
import { Mail } from '@/app/mail/data'

function decodeCalendarContent(content?: string): string | undefined {
  if (!content || typeof globalThis.atob !== 'function') return undefined
  try {
    return globalThis.atob(content)
  } catch {
    return undefined
  }
}

/**
 * Transforms backend EmailMessage format to frontend Mail format
 */
export function transformEmailToMail(email: EmailMessage): Mail {
  // Get primary sender info
  const sender = email.from?.[0] || { name: 'Unknown', address: 'unknown@email.com' }

  // Transform attachments format
  const attachments = email.attachments?.map(att => ({
    id: att.id,
    name: att.filename,
    size: att.size || 0,
    type: att.contentType,
    content: att.content,
    downloadUrl: att.downloadUrl,
    icsContent: att.contentType === 'text/calendar' ? decodeCalendarContent(att.content) : undefined,
  }))

  // Extract participant list (sender + recipients)
  const participants = [
    ...email.from.map(addr => ({ name: addr.name, email: addr.address })),
    ...email.to.map(addr => ({ name: addr.name, email: addr.address })),
    ...(email.cc || []).map(addr => ({ name: addr.name, email: addr.address })),
  ]

  // Determine if email is in trash/deleted folder
  const isDeleted =
    email.folder.includes('Trash') ||
    email.folder.includes('Deleted Items') ||
    email.folder.toLowerCase().includes('trash')

  // Determine if email is archived
  // Gmail: [Gmail]/All Mail is the archive
  // Outlook: Archive folder
  // For others, check if it's in archive folder
  const isArchived =
    email.folder.includes('All Mail') ||
    email.folder.includes('Archive') ||
    email.folder.toLowerCase().includes('archive')

  return {
    id: email.id,
    accountId: email.accountId,
    provider: email.provider,
    ownerKind: email.ownerKind,
    name: sender.name || sender.address.split('@')[0],
    email: sender.address,
    subject: email.subject || '(No Subject)',
    text: email.snippet || email.text || '',
    html: email.html, // Include HTML content if available
    date: email.date,
    read: email.isRead,
    labels: [...new Set([...(email.labels || []), ...(email.folder.toLowerCase().includes('sent') ? ['Sent'] : []), ...(email.folder.toLowerCase().includes('draft') ? ['Drafts'] : []), ...(email.folder.toLowerCase().includes('spam') || email.folder.toLowerCase().includes('junk') ? ['Spam'] : [])])],
    archived: isArchived,
    deleted: isDeleted,
    starred: email.isStarred,
    repliedTo: email.repliedTo,
    snoozeUntil: email.snoozeUntil,
    threadId: email.threadId,
    messageId: email.messageId,
    participants,
    attachments: attachments.length > 0 ? attachments : undefined,
  }
}

/**
 * Transforms an array of EmailMessages to Mail array
 */
export function transformEmailsToMails(emails: EmailMessage[]): Mail[] {
  const transformed = emails.map(transformEmailToMail)
  const groups = new Map<string, Mail[]>()
  for (const mail of transformed) {
    const normalizedSubject = mail.subject.replace(/^(re|fw|fwd):\s*/gi, '').trim().toLowerCase()
    const key = mail.threadId
      ? `${mail.accountId}:thread:${mail.threadId}`
      : `${mail.accountId}:subject:${normalizedSubject}:${mail.email.toLowerCase()}`
    groups.set(key, [...(groups.get(key) || []), mail])
  }
  return [...groups.values()].map((thread) => {
    const ordered = thread.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const latest = ordered.at(-1)!
    const participants = Array.from(new Map(ordered.flatMap((item) => item.participants || []).map((person) => [person.email, person])).values())
    return {
      ...latest,
      read: ordered.every((item) => item.read),
      starred: ordered.some((item) => item.starred),
      messageCount: ordered.length,
      messageIds: ordered.map((item) => item.id),
      threadMessages: ordered,
      participants,
    }
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
