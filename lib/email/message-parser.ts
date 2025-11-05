/**
 * Parse IMAP messages from ImapFlow into our EmailMessage format
 */

import type { FetchMessageObject } from 'imapflow'
import type { EmailMessage, EmailAddress, EmailAttachment } from '@/lib/types/email'
import { simpleParser, AddressObject, ParsedMail } from 'mailparser'

/**
 * Parse an AddressObject into our EmailAddress format
 */
function parseAddress(address: AddressObject | undefined): EmailAddress[] {
  if (!address || !address.value) return []

  return address.value.map((addr) => ({
    name: addr.name || '',
    address: addr.address || '',
  }))
}

/**
 * Generate a plain text snippet from email content (first 200 chars)
 */
function generateSnippet(text: string | undefined, html: string | undefined): string {
  let content = text || ''

  // If no text but has HTML, strip HTML tags
  if (!content && html) {
    content = html
      .replace(/<style[^>]*>.*?<\/style>/gi, '') // Remove style tags
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp;
      .replace(/&amp;/g, '&') // Replace &amp;
      .replace(/&lt;/g, '<') // Replace &lt;
      .replace(/&gt;/g, '>') // Replace &gt;
      .replace(/&quot;/g, '"') // Replace &quot;
  }

  // Clean up whitespace
  content = content
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()

  // Return first 200 characters
  return content.substring(0, 200)
}

/**
 * Parse attachments from parsed mail
 */
function parseAttachments(parsed: ParsedMail): EmailAttachment[] {
  if (!parsed.attachments || parsed.attachments.length === 0) return []

  return parsed.attachments.map((att) => ({
    filename: att.filename || 'untitled',
    content: att.content.toString('base64'),
    contentType: att.contentType || 'application/octet-stream',
    size: att.size,
  }))
}

/**
 * Parse a raw IMAP message into our EmailMessage format
 */
export async function parseIMAPMessage(
  imapMessage: FetchMessageObject,
  accountId: string,
  folder: string
): Promise<EmailMessage> {
  // Parse the raw email using mailparser
  if (!imapMessage.source) {
    throw new Error('IMAP message source is undefined')
  }
  const parsed = await simpleParser(imapMessage.source)

  // Extract from addresses (should be single sender)
  const fromAddresses = parseAddress(parsed.from)

  // Build unique ID from accountId and UID
  const id = `${accountId}:${folder}:${imapMessage.uid}`

  // Check if message has been read
  const isRead = imapMessage.flags?.has('\\Seen') ?? false
  const isStarred = imapMessage.flags?.has('\\Flagged') ?? false

  // Parse references for threading
  const references = parsed.references
    ? Array.isArray(parsed.references)
      ? parsed.references
      : [parsed.references]
    : undefined

  // Build EmailMessage
  const message: EmailMessage = {
    id,
    accountId,
    uid: imapMessage.uid,
    folder,
    messageId: parsed.messageId || id,
    threadId: parsed.inReplyTo || (references && references[0]) || undefined,

    // Headers
    from: fromAddresses,
    to: parseAddress(parsed.to),
    cc: parseAddress(parsed.cc),
    bcc: parseAddress(parsed.bcc),
    replyTo: parseAddress(parsed.replyTo),
    subject: parsed.subject || '(No Subject)',
    date: parsed.date ? parsed.date.toISOString() : new Date().toISOString(),

    // Content
    text: parsed.text || undefined,
    html: parsed.html ? String(parsed.html) : undefined,
    snippet: generateSnippet(parsed.text, parsed.html ? String(parsed.html) : undefined),

    // Metadata
    flags: imapMessage.flags ? Array.from(imapMessage.flags) : [],
    labels: imapMessage.labels ? Array.from(imapMessage.labels) : undefined,
    size: imapMessage.size || 0,
    attachments: parseAttachments(parsed),

    // Client-side fields
    isRead,
    isStarred,
    repliedTo: false, // Will be updated by client logic

    // Sync tracking
    syncedAt: new Date().toISOString(),
  }

  return message
}

/**
 * Parse multiple IMAP messages in parallel
 */
export async function parseIMAPMessages(
  imapMessages: FetchMessageObject[],
  accountId: string,
  folder: string
): Promise<EmailMessage[]> {
  return Promise.all(imapMessages.map((msg) => parseIMAPMessage(msg, accountId, folder)))
}

/**
 * Extract email addresses from a comma-separated string
 */
export function extractEmailAddresses(emailString: string): EmailAddress[] {
  const addresses = emailString
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  return addresses.map((addr) => {
    // Try to extract name and email from format "Name <email@example.com>"
    const match = addr.match(/^(.+?)\s*<(.+?)>$/)
    if (match) {
      return {
        name: match[1].trim(),
        address: match[2].trim(),
      }
    }

    // Just an email address
    return {
      name: '',
      address: addr,
    }
  })
}
