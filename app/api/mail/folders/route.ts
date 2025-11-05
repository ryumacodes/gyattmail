/**
 * List mailbox folders API endpoint
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAccount } from '@/lib/storage/account-storage'
import { listMailboxes } from '@/lib/email/imap-client'
import { normalizeFolderName, getFolderIcon } from '@/lib/email/folder-helpers'

interface FoldersResponse {
  success: boolean
  folders?: Array<{
    name: string
    displayName: string
    icon: string
    path: string
  }>
  error?: string
  details?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')

    if (!accountId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: accountId',
        } as FoldersResponse,
        { status: 400 }
      )
    }

    const account = await getAccount(accountId)
    if (!account) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account not found',
        } as FoldersResponse,
        { status: 404 }
      )
    }

    // List mailboxes from IMAP
    const mailboxes = await listMailboxes(account)

    // Transform to response format
    const folders = mailboxes.map((mailbox) => ({
      name: mailbox.name,
      displayName: normalizeFolderName(mailbox.name),
      icon: getFolderIcon(mailbox.name),
      path: mailbox.path,
    }))

    return NextResponse.json({
      success: true,
      folders,
    } as FoldersResponse)
  } catch (error) {
    console.error('List folders error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list folders',
        details: error instanceof Error ? error.message : 'Unknown error',
      } as FoldersResponse,
      { status: 500 }
    )
  }
}
