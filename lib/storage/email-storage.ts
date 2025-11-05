/**
 * File-based email storage
 * Emails are stored in .data/emails/{accountId}/{folder}.json
 */

import { promises as fs } from 'fs'
import path from 'path'
import type { EmailMessage } from '@/lib/types/email'

const DATA_DIR = path.join(process.cwd(), '.data', 'emails')

/**
 * Ensure the email data directory exists
 */
async function ensureEmailsDir(accountId: string, folder: string): Promise<string> {
  const folderPath = path.join(DATA_DIR, accountId)
  await fs.mkdir(folderPath, { recursive: true })
  return folderPath
}

/**
 * Get the file path for a specific folder's emails
 */
function getEmailFilePath(accountId: string, folder: string): string {
  // Sanitize folder name for filesystem (replace / with _)
  const sanitizedFolder = folder.replace(/\//g, '_')
  return path.join(DATA_DIR, accountId, `${sanitizedFolder}.json`)
}

/**
 * Load all emails for a specific folder
 */
export async function loadEmails(accountId: string, folder: string): Promise<EmailMessage[]> {
  try {
    const filePath = getEmailFilePath(accountId, folder)
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data) as EmailMessage[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [] // File doesn't exist yet
    }
    throw error
  }
}

/**
 * Save emails for a specific folder (replaces entire file)
 */
export async function saveEmails(
  accountId: string,
  folder: string,
  emails: EmailMessage[]
): Promise<void> {
  await ensureEmailsDir(accountId, folder)
  const filePath = getEmailFilePath(accountId, folder)
  await fs.writeFile(filePath, JSON.stringify(emails, null, 2), 'utf-8')
}

/**
 * Add new emails to a folder (merges with existing, avoiding duplicates)
 */
export async function addEmails(
  accountId: string,
  folder: string,
  newEmails: EmailMessage[]
): Promise<void> {
  const existing = await loadEmails(accountId, folder)
  const existingIds = new Set(existing.map((e) => e.id))

  // Add only emails that don't already exist
  const toAdd = newEmails.filter((e) => !existingIds.has(e.id))

  if (toAdd.length > 0) {
    const combined = [...existing, ...toAdd]
    // Sort by date (newest first)
    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    await saveEmails(accountId, folder, combined)
  }
}

/**
 * Get a single email by ID
 */
export async function getEmail(emailId: string): Promise<EmailMessage | null> {
  // Parse ID format: accountId:folder:uid
  const parts = emailId.split(':')
  if (parts.length < 3) return null

  const accountId = parts[0]
  const folder = parts.slice(1, -1).join(':') // Handle folders with colons
  const uid = parseInt(parts[parts.length - 1])

  const emails = await loadEmails(accountId, folder)
  return emails.find((e) => e.uid === uid) || null
}

/**
 * Update a single email
 */
export async function updateEmail(email: EmailMessage): Promise<void> {
  const emails = await loadEmails(email.accountId, email.folder)
  const index = emails.findIndex((e) => e.id === email.id)

  if (index >= 0) {
    emails[index] = email
    await saveEmails(email.accountId, email.folder, emails)
  } else {
    // Email doesn't exist, add it
    await addEmails(email.accountId, email.folder, [email])
  }
}

/**
 * Update email flags (read, starred)
 */
export async function updateEmailFlags(
  emailId: string,
  updates: { isRead?: boolean; isStarred?: boolean }
): Promise<void> {
  const email = await getEmail(emailId)
  if (!email) return

  if (updates.isRead !== undefined) {
    email.isRead = updates.isRead
    // Update flags array
    if (updates.isRead) {
      if (!email.flags.includes('\\Seen')) {
        email.flags.push('\\Seen')
      }
    } else {
      email.flags = email.flags.filter((f) => f !== '\\Seen')
    }
  }

  if (updates.isStarred !== undefined) {
    email.isStarred = updates.isStarred
    // Update flags array
    if (updates.isStarred) {
      if (!email.flags.includes('\\Flagged')) {
        email.flags.push('\\Flagged')
      }
    } else {
      email.flags = email.flags.filter((f) => f !== '\\Flagged')
    }
  }

  await updateEmail(email)
}

/**
 * Delete emails for a specific folder
 */
export async function deleteEmails(accountId: string, folder: string): Promise<void> {
  try {
    const filePath = getEmailFilePath(accountId, folder)
    await fs.unlink(filePath)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
  }
}

/**
 * Delete all emails for an account
 */
export async function deleteAccountEmails(accountId: string): Promise<void> {
  try {
    const accountPath = path.join(DATA_DIR, accountId)
    await fs.rm(accountPath, { recursive: true })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
  }
}

/**
 * Search emails across all folders for an account
 */
export async function searchEmails(
  accountId: string,
  query: string
): Promise<EmailMessage[]> {
  const accountPath = path.join(DATA_DIR, accountId)
  let allEmails: EmailMessage[] = []

  try {
    const files = await fs.readdir(accountPath)
    for (const file of files) {
      if (file.endsWith('.json')) {
        const folder = file.replace('.json', '').replace(/_/g, '/')
        const emails = await loadEmails(accountId, folder)
        allEmails = allEmails.concat(emails)
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
  }

  // Simple text search in subject, from, to, and snippet
  const lowerQuery = query.toLowerCase()
  return allEmails.filter((email) => {
    return (
      email.subject.toLowerCase().includes(lowerQuery) ||
      email.from.some((addr) =>
        `${addr.name} ${addr.address}`.toLowerCase().includes(lowerQuery)
      ) ||
      email.to.some((addr) =>
        `${addr.name} ${addr.address}`.toLowerCase().includes(lowerQuery)
      ) ||
      email.snippet?.toLowerCase().includes(lowerQuery)
    )
  })
}

/**
 * Get email count for a folder
 */
export async function getEmailCount(accountId: string, folder: string): Promise<number> {
  const emails = await loadEmails(accountId, folder)
  return emails.length
}

/**
 * Get unread email count for a folder
 */
export async function getUnreadCount(accountId: string, folder: string): Promise<number> {
  const emails = await loadEmails(accountId, folder)
  return emails.filter((e) => !e.isRead).length
}
