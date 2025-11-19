import { EmailMessage } from '@/lib/types/email'
import { Mail } from '@/app/mail/data'

/**
 * Transforms backend EmailMessage format to frontend Mail format
 */
export function transformEmailToMail(email: EmailMessage): Mail {
  // Get primary sender info
  const sender = email.from?.[0] || { name: 'Unknown', address: 'unknown@email.com' }

  // Transform attachments format
  const attachments = email.attachments?.map(att => ({
    name: att.filename,
    size: att.size || 0,
    type: att.contentType,
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
    name: sender.name || sender.address.split('@')[0],
    email: sender.address,
    subject: email.subject || '(No Subject)',
    text: email.snippet || email.text || '',
    html: email.html, // Include HTML content if available
    date: email.date,
    read: email.isRead,
    labels: email.labels || [],
    archived: isArchived,
    deleted: isDeleted,
    starred: email.isStarred,
    repliedTo: email.repliedTo,
    snoozeUntil: email.snoozeUntil,
    threadId: email.threadId,
    participants,
    attachments: attachments.length > 0 ? attachments : undefined,
  }
}

/**
 * Transforms an array of EmailMessages to Mail array
 */
export function transformEmailsToMails(emails: EmailMessage[]): Mail[] {
  return emails.map(transformEmailToMail)
}
