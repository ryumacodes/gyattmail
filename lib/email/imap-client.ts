/**
 * IMAP client with OAuth2 support for Gmail, Outlook, and custom IMAP servers
 * Uses ImapFlow library for modern IMAP access
 */

import { ImapFlow } from 'imapflow'
import type { EmailAccount, IMAPFolder } from '@/lib/types/email'
import { decrypt, encrypt } from '@/lib/storage/encryption'
import { refreshGmailAccessToken, refreshOutlookAccessToken } from './oauth-manager'
import { updateAccountTokens } from '@/lib/storage/account-storage'

/**
 * Create IMAP connection for Gmail with OAuth2
 */
export async function connectGmailIMAP(account: EmailAccount): Promise<ImapFlow> {
  if (!account.refreshToken) {
    throw new Error('Gmail account missing refresh token')
  }

  let accessToken: string

  // Check if we have a valid access token
  const now = Date.now()
  const tokenExpiry = account.tokenExpiry || 0
  const isTokenExpired = tokenExpiry - (5 * 60 * 1000) <= now // 5 minute buffer

  if (account.accessToken && !isTokenExpired) {
    // Use existing access token if it's still valid
    accessToken = decrypt(account.accessToken)
  } else {
    // Refresh access token if expired
    const refreshToken = decrypt(account.refreshToken)

    // Decrypt OAuth credentials if they exist (for user-provided credentials)
    const clientId = account.oauthClientId ? decrypt(account.oauthClientId) : undefined
    const clientSecret = account.oauthClientSecret ? decrypt(account.oauthClientSecret) : undefined

    accessToken = await refreshGmailAccessToken(refreshToken, clientId, clientSecret)

    // Save refreshed token to account storage (expires in 1 hour)
    const tokenExpiry = Date.now() + (3600 * 1000) // 1 hour from now
    await updateAccountTokens(account.id, encrypt(accessToken), undefined, tokenExpiry)
  }

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
      user: account.email,
      accessToken,
    },
    logger: false, // Set to console for debugging
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 30000, // 30 seconds
    socketTimeout: 30000, // 30 seconds for socket inactivity
  })

  await client.connect()
  return client
}

/**
 * Create IMAP connection for Outlook with OAuth2
 */
export async function connectOutlookIMAP(account: EmailAccount): Promise<ImapFlow> {
  if (!account.refreshToken) {
    throw new Error('Outlook account missing refresh token')
  }

  let accessToken: string

  // Check if we have a valid access token
  const now = Date.now()
  const tokenExpiry = account.tokenExpiry || 0
  const isTokenExpired = tokenExpiry - (5 * 60 * 1000) <= now // 5 minute buffer

  if (account.accessToken && !isTokenExpired) {
    // Use existing access token if it's still valid
    accessToken = decrypt(account.accessToken)
  } else {
    // Refresh access token if expired
    const refreshToken = decrypt(account.refreshToken)

    // Decrypt OAuth credentials if they exist (for user-provided credentials)
    const clientId = account.oauthClientId ? decrypt(account.oauthClientId) : undefined
    const clientSecret = account.oauthClientSecret ? decrypt(account.oauthClientSecret) : undefined

    accessToken = await refreshOutlookAccessToken(refreshToken, clientId, clientSecret)

    // Save refreshed token to account storage (expires in 1 hour)
    const tokenExpiry = Date.now() + (3600 * 1000) // 1 hour from now
    await updateAccountTokens(account.id, encrypt(accessToken), undefined, tokenExpiry)
  }

  const client = new ImapFlow({
    host: 'outlook.office365.com',
    port: 993,
    secure: true,
    auth: {
      user: account.email,
      accessToken,
    },
    logger: false,
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 30000, // 30 seconds
    socketTimeout: 30000, // 30 seconds for socket inactivity
  })

  await client.connect()
  return client
}

/**
 * Create IMAP connection for custom IMAP server with username/password
 */
export async function connectCustomIMAP(account: EmailAccount): Promise<ImapFlow> {
  if (!account.imapHost || !account.imapPort || !account.imapPassword) {
    throw new Error('Custom IMAP account missing required fields')
  }

  const password = decrypt(account.imapPassword)

  const client = new ImapFlow({
    host: account.imapHost,
    port: account.imapPort,
    secure: account.imapSecure ?? true,
    auth: {
      user: account.imapUser || account.email,
      pass: password,
    },
    logger: false,
  })

  await client.connect()
  return client
}

/**
 * Create IMAP connection based on account provider
 */
export async function connectIMAP(account: EmailAccount): Promise<ImapFlow> {
  try {
    switch (account.provider) {
      case 'gmail':
        return await connectGmailIMAP(account)
      case 'outlook':
        return await connectOutlookIMAP(account)
      case 'custom':
        return await connectCustomIMAP(account)
      default:
        throw new Error(`Unsupported provider: ${account.provider}`)
    }
  } catch (error) {
    console.error(`Failed to connect IMAP for ${account.email}:`, error)
    throw new Error(
      `IMAP connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Test IMAP connection
 */
export async function testIMAPConnection(account: EmailAccount): Promise<boolean> {
  let client: ImapFlow | null = null
  try {
    client = await connectIMAP(account)
    // Try to list mailboxes as a connection test
    await client.list()
    return true
  } catch (error) {
    console.error('IMAP connection test failed:', error)
    return false
  } finally {
    if (client) {
      await client.logout()
    }
  }
}

/**
 * List all mailboxes/folders for an account
 */
export async function listMailboxes(account: EmailAccount): Promise<IMAPFolder[]> {
  const client = await connectIMAP(account)

  try {
    const mailboxes = await client.list()

    return mailboxes.map((mailbox) => ({
      name: mailbox.name,
      path: mailbox.path,
      delimiter: mailbox.delimiter,
      flags: Array.from(mailbox.flags),
      specialUse: mailbox.specialUse,
      exists: 0, // Will be populated when we select the mailbox
      recent: 0,
      unseen: 0,
    }))
  } finally {
    await client.logout()
  }
}

/**
 * Get mailbox status (message counts)
 */
export async function getMailboxStatus(
  account: EmailAccount,
  folder: string = 'INBOX'
): Promise<{ exists: number; unseen: number; uidValidity: number; uidNext: number }> {
  const client = await connectIMAP(account)

  try {
    const status = await client.status(folder, {
      messages: true,
      unseen: true,
      uidValidity: true,
      uidNext: true,
    })

    return {
      exists: status.messages || 0,
      unseen: status.unseen || 0,
      uidValidity: Number(status.uidValidity || 0),
      uidNext: Number(status.uidNext || 0),
    }
  } finally {
    await client.logout()
  }
}

/**
 * Update message flags (mark as read/unread, starred/unstarred)
 */
export async function updateMessageFlags(
  account: EmailAccount,
  folder: string,
  uid: number,
  flags: { read?: boolean; starred?: boolean }
): Promise<void> {
  const client = await connectIMAP(account)

  try {
    // Select the mailbox
    await client.mailboxOpen(folder)

    // Add or remove \Seen flag (read status)
    if (flags.read !== undefined) {
      if (flags.read) {
        await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true })
      } else {
        await client.messageFlagsRemove(uid, ['\\Seen'], { uid: true })
      }
    }

    // Add or remove \Flagged flag (starred status)
    if (flags.starred !== undefined) {
      if (flags.starred) {
        await client.messageFlagsAdd(uid, ['\\Flagged'], { uid: true })
      } else {
        await client.messageFlagsRemove(uid, ['\\Flagged'], { uid: true })
      }
    }
  } finally {
    await client.logout()
  }
}

/**
 * Delete a message (move to trash or mark as deleted)
 */
export async function deleteMessage(
  account: EmailAccount,
  folder: string,
  uid: number
): Promise<void> {
  const client = await connectIMAP(account)

  try {
    await client.mailboxOpen(folder)

    // Add \Deleted flag
    await client.messageFlagsAdd(uid, ['\\Deleted'], { uid: true })

    // For Gmail, also mark as deleted (moves to trash)
    if (account.provider === 'gmail') {
      await client.messageDelete(uid, { uid: true })
    }
  } finally {
    await client.logout()
  }
}

/**
 * Move a message to another folder
 */
export async function moveMessage(
  account: EmailAccount,
  sourceFolder: string,
  targetFolder: string,
  uid: number
): Promise<void> {
  const client = await connectIMAP(account)

  try {
    await client.mailboxOpen(sourceFolder)
    await client.messageMove(uid, targetFolder, { uid: true })
  } finally {
    await client.logout()
  }
}

/**
 * Safely close IMAP connection
 */
export async function closeIMAPConnection(client: ImapFlow): Promise<void> {
  try {
    await client.logout()
  } catch (error) {
    console.error('Error closing IMAP connection:', error)
  }
}
