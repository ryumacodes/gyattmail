/**
 * Fetch emails API endpoint
 * Returns stored emails from local storage (not directly from IMAP)
 * Use /api/mail/sync to trigger IMAP synchronization
 */

import { NextRequest, NextResponse } from 'next/server'
import { loadEmails, searchEmails } from '@/lib/storage/email-storage'
import type { FetchEmailsResponse } from '@/lib/types/email'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('accountId')
    const folder = searchParams.get('folder') || 'INBOX'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const query = searchParams.get('query') // Search query

    // Validate required parameters
    if (!accountId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: accountId',
        } as FetchEmailsResponse,
        { status: 400 }
      )
    }

    let emails

    // Handle search query
    if (query) {
      emails = await searchEmails(accountId, query)
    } else {
      // Load emails from storage
      emails = await loadEmails(accountId, folder)
    }

    // Apply pagination
    const total = emails.length
    const paginatedEmails = emails.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      emails: paginatedEmails,
      total,
    } as FetchEmailsResponse)
  } catch (error) {
    console.error('Fetch emails error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch emails',
        details: error instanceof Error ? error.message : 'Unknown error',
      } as FetchEmailsResponse,
      { status: 500 }
    )
  }
}
