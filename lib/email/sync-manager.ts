/**
 * Email synchronization manager
 * Handles incremental sync with UIDVALIDITY tracking
 */

import type { EmailAccount, EmailMessage } from '@/lib/types/email'
import { connectIMAP, getMailboxStatus, closeIMAPConnection } from './imap-client'
import { parseIMAPMessages } from './message-parser'
import { addEmails, loadEmails } from '@/lib/storage/email-storage'
import {
  getSyncState,
  updateSyncState,
  hasUIDValidityChanged,
  resetSyncState,
} from '@/lib/storage/sync-state-storage'
import { updateAccountStatus } from '@/lib/storage/account-storage'

export interface SyncResult {
  accountId: string
  folder: string
  newEmails: number
  totalEmails: number
  error?: string
}

export interface SyncProgress {
  accountId: string
  folder: string
  status: 'connecting' | 'syncing' | 'completed' | 'error'
  message: string
  newEmails?: number
  totalEmails?: number
}

/**
 * Sync a single folder for an account
 */
export async function syncFolder(
  account: EmailAccount,
  folder: string = 'INBOX',
  onProgress?: (progress: SyncProgress) => void
): Promise<SyncResult> {
  let client

  try {
    // Report connection progress
    onProgress?.({
      accountId: account.id,
      folder,
      status: 'connecting',
      message: `Connecting to ${folder}...`,
    })

    // Connect to IMAP
    client = await connectIMAP(account)

    // Get mailbox status
    const status = await getMailboxStatus(account, folder)

    // Check if mailbox is empty
    if (status.exists === 0) {
      onProgress?.({
        accountId: account.id,
        folder,
        status: 'completed',
        message: `${folder} is empty`,
        newEmails: 0,
        totalEmails: 0,
      })

      return {
        accountId: account.id,
        folder,
        newEmails: 0,
        totalEmails: 0,
      }
    }

    // Check sync state
    const syncState = await getSyncState(account.id, folder)

    // Check if UIDVALIDITY changed (requires full resync)
    if (await hasUIDValidityChanged(account.id, folder, status.uidValidity)) {
      console.log(`UIDVALIDITY changed for ${folder}, performing full resync`)
      await resetSyncState(account.id, folder)
    }

    // Determine which messages to fetch
    let fetchRange: string
    const lastSeenUid = syncState?.lastSeenUid || 0

    if (lastSeenUid === 0) {
      // First sync: fetch last 50 messages
      const startUid = Math.max(1, status.uidNext - 50)
      fetchRange = `${startUid}:*`

      onProgress?.({
        accountId: account.id,
        folder,
        status: 'syncing',
        message: `Initial sync: fetching recent emails...`,
      })
    } else {
      // Incremental sync: fetch new messages
      fetchRange = `${lastSeenUid + 1}:*`

      onProgress?.({
        accountId: account.id,
        folder,
        status: 'syncing',
        message: `Syncing new emails...`,
      })
    }

    // Select the mailbox
    await client.mailboxOpen(folder)

    // Fetch messages
    const messages: any[] = []
    for await (const message of client.fetch(fetchRange, {
      source: true, // Get full raw email source
      uid: true,
      flags: true,
      size: true,
      labels: true,
    })) {
      messages.push(message)
    }

    // Parse messages
    const parsedEmails = await parseIMAPMessages(messages, account.id, folder)

    // Store emails
    if (parsedEmails.length > 0) {
      await addEmails(account.id, folder, parsedEmails)

      // Update sync state with highest UID
      const highestUid = Math.max(...parsedEmails.map((e) => e.uid))
      await updateSyncState(account.id, folder, status.uidValidity, highestUid)
    } else {
      // No new messages, but update sync state anyway
      await updateSyncState(account.id, folder, status.uidValidity, lastSeenUid)
    }

    // Get total count
    const totalEmails = await loadEmails(account.id, folder)

    onProgress?.({
      accountId: account.id,
      folder,
      status: 'completed',
      message: `Sync complete`,
      newEmails: parsedEmails.length,
      totalEmails: totalEmails.length,
    })

    // Update account status
    await updateAccountStatus(account.id, 'connected')

    return {
      accountId: account.id,
      folder,
      newEmails: parsedEmails.length,
      totalEmails: totalEmails.length,
    }
  } catch (error) {
    console.error(`Sync error for ${account.email} ${folder}:`, error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    onProgress?.({
      accountId: account.id,
      folder,
      status: 'error',
      message: `Sync failed: ${errorMessage}`,
    })

    // Update account status to failed
    await updateAccountStatus(account.id, 'failed', errorMessage)

    return {
      accountId: account.id,
      folder,
      newEmails: 0,
      totalEmails: 0,
      error: errorMessage,
    }
  } finally {
    if (client) {
      await closeIMAPConnection(client)
    }
  }
}

/**
 * Sync multiple folders for an account
 */
export async function syncAccount(
  account: EmailAccount,
  folders: string[] = ['INBOX'],
  onProgress?: (progress: SyncProgress) => void
): Promise<SyncResult[]> {
  const results: SyncResult[] = []

  for (const folder of folders) {
    const result = await syncFolder(account, folder, onProgress)
    results.push(result)
  }

  return results
}

/**
 * Sync all accounts
 */
export async function syncAllAccounts(
  accounts: EmailAccount[],
  folders: string[] = ['INBOX'],
  onProgress?: (progress: SyncProgress) => void
): Promise<SyncResult[]> {
  const results: SyncResult[] = []

  // Sync accounts in parallel (with limit to avoid overwhelming IMAP servers)
  const CONCURRENT_LIMIT = 3
  const chunks: EmailAccount[][] = []

  for (let i = 0; i < accounts.length; i += CONCURRENT_LIMIT) {
    chunks.push(accounts.slice(i, i + CONCURRENT_LIMIT))
  }

  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map((account) => syncAccount(account, folders, onProgress))
    )
    results.push(...chunkResults.flat())
  }

  return results
}

/**
 * Quick sync: only check INBOX for all accounts
 */
export async function quickSync(
  accounts: EmailAccount[],
  onProgress?: (progress: SyncProgress) => void
): Promise<SyncResult[]> {
  return syncAllAccounts(accounts, ['INBOX'], onProgress)
}
