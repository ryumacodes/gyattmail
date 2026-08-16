/**
 * Gmail OAuth2 initiation endpoint
 * Accepts client_id and client_secret via POST body (secure)
 * Returns authorization URL for client-side redirect
 */

import { NextRequest, NextResponse } from 'next/server'
import { createOAuthSession } from '@/lib/storage/oauth-session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, clientSecret } = body

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gmail OAuth credentials not provided',
          message: 'Please provide clientId and clientSecret',
        },
        { status: 400 }
      )
    }

    // Create secure server-side session for OAuth flow
    const sessionId = await createOAuthSession('gmail', clientId, clientSecret)

    // Build Google OAuth2 authorization URL
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/gmail/callback`

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', 'https://mail.google.com/ https://www.googleapis.com/auth/userinfo.email')
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'consent')

    // Use session ID in state (no credentials exposed)
    authUrl.searchParams.set('state', sessionId)

    // Return authorization URL for client-side redirect
    return NextResponse.json({
      success: true,
      authorizationUrl: authUrl.toString(),
    })
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
