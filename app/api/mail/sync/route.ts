/**
 * Manual sync API endpoint
 * Triggers IMAP synchronization for one or more accounts
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAccount, getAllAccounts } from '@/lib/storage/account-storage'
import { syncAccount, quickSync } from '@/lib/email/sync-manager'
import { getEssentialFolders, getStandardFolders } from '@/lib/email/folder-helpers'

interface SyncRequest {
  accountId?: string // Optional: sync specific account
  folders?: string[] // Optional: folders to sync (default: essential folders)
  fullSync?: boolean // If true, sync all standard folders (default: false)
}

interface SyncResponse {
  success: boolean
  results?: Array<{
    accountId: string
    folder: string
    newEmails: number
    totalEmails: number
    error?: string
  }>
  error?: string
  details?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SyncRequest = await request.json().catch(() => ({}))
    const accountId = body.accountId
    const fullSync = body.fullSync || false

    if (accountId) {
      // Sync specific account
      const account = await getAccount(accountId)

      if (!account) {
        return NextResponse.json(
          {
            success: false,
            error: 'Account not found',
          } as SyncResponse,
          { status: 404 }
        )
      }

      // Determine which folders to sync
      let folders = body.folders
      if (!folders) {
        folders = fullSync
          ? getStandardFolders(account.provider)
          : getEssentialFolders(account.provider)
      }

      // Perform sync
      const results = await syncAccount(account, folders)

      return NextResponse.json({
        success: true,
        results,
      } as SyncResponse)
    } else {
      // Sync all accounts
      const accounts = await getAllAccounts()

      if (accounts.length === 0) {
        return NextResponse.json({
          success: true,
          results: [],
        } as SyncResponse)
      }

      // Perform quick sync (INBOX only for all accounts)
      const results = await quickSync(accounts)

      return NextResponse.json({
        success: true,
        results,
      } as SyncResponse)
    }
  } catch (error) {
    console.error('Sync error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync emails',
        details: error instanceof Error ? error.message : 'Unknown error',
      } as SyncResponse,
      { status: 500 }
    )
  }
}
