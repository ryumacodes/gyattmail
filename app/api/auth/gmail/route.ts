/**
 * Gmail OAuth2 initiation endpoint
 * Returns the Google authorization URL for user to grant permissions
 */

import { NextResponse } from 'next/server'
import { getGmailAuthUrl } from '@/lib/email/oauth-manager'

export async function GET() {
  try {
    const authUrl = getGmailAuthUrl()

    return NextResponse.json({
      success: true,
      authUrl,
    })
  } catch (error) {
    console.error('Failed to generate Gmail OAuth URL:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initiate Gmail authentication',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
