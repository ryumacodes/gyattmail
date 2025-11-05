/**
 * Accounts API endpoint
 * Handles listing and managing email accounts
 */

import { NextResponse } from 'next/server'
import { getAllAccounts } from '@/lib/storage/account-storage'

/**
 * GET /api/accounts
 * Returns list of all connected email accounts (without sensitive data)
 */
export async function GET() {
  try {
    const accounts = await getAllAccounts()

    // Strip sensitive fields before sending to client
    const safeAccounts = accounts.map((acc) => ({
      id: acc.id,
      email: acc.email,
      provider: acc.provider,
      authType: acc.authType,
      label: acc.label,
      connectionStatus: acc.connectionStatus,
      lastError: acc.lastError,
      lastSyncedAt: acc.lastSyncedAt,
      createdAt: acc.createdAt,
    }))

    return NextResponse.json({
      success: true,
      accounts: safeAccounts,
    })
  } catch (error) {
    console.error('Failed to list accounts:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve accounts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
