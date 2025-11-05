/**
 * Outlook OAuth2 initiation endpoint
 * Returns the Microsoft authorization URL for user to grant permissions
 */

import { NextResponse } from 'next/server'
import { getOutlookAuthUrl } from '@/lib/email/oauth-manager'

export async function GET() {
  try {
    const authUrl = await getOutlookAuthUrl()

    return NextResponse.json({
      success: true,
      authUrl,
    })
  } catch (error) {
    console.error('Failed to generate Outlook OAuth URL:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initiate Outlook authentication',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
