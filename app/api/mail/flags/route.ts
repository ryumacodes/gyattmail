/**
 * Update email flags API endpoint
 * Handles marking emails as read/unread, starred/unstarred
 * Updates both local storage and IMAP server
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAccount } from '@/lib/storage/account-storage'
import { updateMessageFlags } from '@/lib/email/imap-client'
import { updateEmailFlags } from '@/lib/storage/email-storage'

interface UpdateFlagsRequest {
  emailId: string // Format: accountId:folder:uid
  read?: boolean
  starred?: boolean
}

interface UpdateFlagsResponse {
  success: boolean
  error?: string
  details?: string
}

export async function PATCH(request: NextRequest) {
  try {
    const body: UpdateFlagsRequest = await request.json()

    // Validate required fields
    if (!body.emailId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: emailId',
        } as UpdateFlagsResponse,
        { status: 400 }
      )
    }

    if (body.read === undefined && body.starred === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one flag update (read or starred) is required',
        } as UpdateFlagsResponse,
        { status: 400 }
      )
    }

    // Parse emailId (format: accountId:folder:uid)
    const parts = body.emailId.split(':')
    if (parts.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid emailId format',
        } as UpdateFlagsResponse,
        { status: 400 }
      )
    }

    const accountId = parts[0]
    const folder = parts.slice(1, -1).join(':') // Handle folders with colons
    const uid = parseInt(parts[parts.length - 1])

    // Get account
    const account = await getAccount(accountId)
    if (!account) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account not found',
        } as UpdateFlagsResponse,
        { status: 404 }
      )
    }

    // Update flags on IMAP server
    await updateMessageFlags(account, folder, uid, {
      read: body.read,
      starred: body.starred,
    })

    // Update local storage
    await updateEmailFlags(body.emailId, {
      isRead: body.read,
      isStarred: body.starred,
    })

    return NextResponse.json({
      success: true,
    } as UpdateFlagsResponse)
  } catch (error) {
    console.error('Update flags error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update flags',
        details: error instanceof Error ? error.message : 'Unknown error',
      } as UpdateFlagsResponse,
      { status: 500 }
    )
  }
}
