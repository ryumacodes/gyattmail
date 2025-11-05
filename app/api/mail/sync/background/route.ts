/**
 * Background sync endpoint
 * Performs quick sync of all accounts (INBOX + Sent + Drafts only)
 * Designed to be called periodically by client or cron job
 */

import { NextResponse } from 'next/server'
import { getAllAccounts } from '@/lib/storage/account-storage'
import { syncAccount } from '@/lib/email/sync-manager'
import { getEssentialFolders } from '@/lib/email/folder-helpers'

// Track last sync time to prevent too-frequent syncs
let lastSyncTime: number = 0
const MIN_SYNC_INTERVAL = 60000 // 1 minute minimum between syncs

export async function POST() {
  try {
    const now = Date.now()

    // Check if enough time has passed since last sync
    if (now - lastSyncTime < MIN_SYNC_INTERVAL) {
      return NextResponse.json({
        success: true,
        message: 'Sync skipped (too soon since last sync)',
        nextSyncAvailableIn: Math.ceil((MIN_SYNC_INTERVAL - (now - lastSyncTime)) / 1000),
      })
    }

    lastSyncTime = now

    const accounts = await getAllAccounts()

    if (accounts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No accounts to sync',
        accountsSynced: 0,
      })
    }

    // Sync all accounts in parallel (limited concurrency)
    const results = []
    const BATCH_SIZE = 3 // Sync 3 accounts at a time

    for (let i = 0; i < accounts.length; i += BATCH_SIZE) {
      const batch = accounts.slice(i, i + BATCH_SIZE)
      const batchResults = await Promise.all(
        batch.map(async (account) => {
          try {
            const folders = getEssentialFolders(account.provider)
            const syncResults = await syncAccount(account, folders)
            return {
              accountId: account.id,
              email: account.email,
              success: true,
              results: syncResults,
            }
          } catch (error) {
            console.error(`Background sync failed for ${account.email}:`, error)
            return {
              accountId: account.id,
              email: account.email,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            }
          }
        })
      )
      results.push(...batchResults)
    }

    // Calculate stats
    const successful = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length
    const totalNewEmails = results
      .filter((r) => r.success)
      .reduce(
        (sum, r) => sum + (r.results?.reduce((s, res) => s + res.newEmails, 0) || 0),
        0
      )

    return NextResponse.json({
      success: true,
      message: 'Background sync completed',
      accountsSynced: successful,
      accountsFailed: failed,
      totalNewEmails,
      results,
      syncedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Background sync error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Background sync failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Also support GET for health checks
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Background sync endpoint is ready',
    lastSyncTime: lastSyncTime > 0 ? new Date(lastSyncTime).toISOString() : null,
    minSyncInterval: `${MIN_SYNC_INTERVAL / 1000}s`,
  })
}
