/**
 * Server-Sent Events (SSE) endpoint for real-time sync updates
 * Clients connect to this endpoint to receive live updates as emails sync
 */

import { NextRequest } from 'next/server'
import { getAllAccounts, getAccount } from '@/lib/storage/account-storage'
import { syncAccount, SyncProgress } from '@/lib/email/sync-manager'
import { getEssentialFolders } from '@/lib/email/folder-helpers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const accountId = searchParams.get('accountId')
  const fullSync = searchParams.get('fullSync') === 'true'

  // Create a TransformStream for SSE
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  const encoder = new TextEncoder()

  // Send SSE message helper
  const sendMessage = async (event: string, data: any) => {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    await writer.write(encoder.encode(message))
  }

  // Send keep-alive ping every 30 seconds
  const keepAliveInterval = setInterval(async () => {
    try {
      await sendMessage('ping', { timestamp: new Date().toISOString() })
    } catch (error) {
      clearInterval(keepAliveInterval)
    }
  }, 30000)

  // Start sync in background
  ;(async () => {
    try {
      // Send initial connection message
      await sendMessage('connected', {
        message: 'Connected to sync stream',
        timestamp: new Date().toISOString(),
      })

      // Progress callback
      const onProgress = async (progress: SyncProgress) => {
        await sendMessage('progress', progress)
      }

      if (accountId) {
        // Sync specific account
        const account = await getAccount(accountId)
        if (!account) {
          await sendMessage('error', {
            error: 'Account not found',
            accountId,
          })
          await writer.close()
          return
        }

        await sendMessage('sync-start', {
          accountId: account.id,
          email: account.email,
        })

        // Sync essential folders by default
        const folders = getEssentialFolders(account.provider)
        const results = await syncAccount(account, folders, onProgress)

        await sendMessage('sync-complete', {
          accountId: account.id,
          results,
        })
      } else {
        // Sync all accounts
        const accounts = await getAllAccounts()

        await sendMessage('sync-start', {
          totalAccounts: accounts.length,
        })

        for (const account of accounts) {
          // Sync essential folders for each account
          const folders = getEssentialFolders(account.provider)
          const results = await syncAccount(account, folders, onProgress)

          await sendMessage('account-complete', {
            accountId: account.id,
            results,
          })
        }

        await sendMessage('sync-complete', {
          totalAccounts: accounts.length,
        })
      }

      // Close the stream after sync completes
      clearInterval(keepAliveInterval)
      await writer.close()
    } catch (error) {
      console.error('SSE sync error:', error)
      await sendMessage('error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      clearInterval(keepAliveInterval)
      await writer.close()
    }
  })()

  // Return SSE response
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
