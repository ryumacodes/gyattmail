/**
 * Gmail OAuth2 initiation endpoint
 * Accepts client_id and client_secret from query params (user-provided)
 * or falls back to environment variables
 * Redirects to Google OAuth authorization page
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id') || process.env.GOOGLE_CLIENT_ID
    const clientSecret = searchParams.get('client_secret') || process.env.GOOGLE_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gmail OAuth credentials not configured',
          message: 'Please provide client_id and client_secret',
        },
        { status: 400 }
      )
    }

    // Build Google OAuth2 authorization URL
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/gmail/callback`

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', 'https://mail.google.com/ https://www.googleapis.com/auth/userinfo.email')
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'consent')

    // Store credentials in URL state for callback
    authUrl.searchParams.set('state', Buffer.from(JSON.stringify({ clientId, clientSecret })).toString('base64'))

    // Redirect to Google OAuth
    return NextResponse.redirect(authUrl.toString())
  } catch (error) {
    console.error('Failed to initiate Gmail OAuth:', error)

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
