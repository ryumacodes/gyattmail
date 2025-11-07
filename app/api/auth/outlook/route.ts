/**
 * Outlook OAuth2 initiation endpoint
 * Accepts client_id and client_secret via POST body (secure)
 * Returns authorization URL for client-side redirect
 */

import { NextRequest, NextResponse } from 'next/server'
import { createOAuthSession } from '@/lib/storage/oauth-session'
import { ConfidentialClientApplication } from '@azure/msal-node'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, clientSecret } = body

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Outlook OAuth credentials not provided',
          message: 'Please provide clientId and clientSecret',
        },
        { status: 400 }
      )
    }

    // Create secure server-side session for OAuth flow
    const sessionId = createOAuthSession('outlook', clientId, clientSecret)

    // Build Microsoft OAuth2 authorization URL
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/outlook/callback`

    const msalClient = new ConfidentialClientApplication({
      auth: {
        clientId,
        clientSecret,
        authority: 'https://login.microsoftonline.com/common',
      },
    })

    const authCodeUrlParameters = {
      scopes: [
        'https://outlook.office.com/IMAP.AccessAsUser.All',
        'https://outlook.office.com/SMTP.Send',
        'https://outlook.office.com/User.Read',
        'offline_access',
      ],
      redirectUri,
      prompt: 'consent',
      state: sessionId, // Use session ID in state (no credentials exposed)
    }

    const authUrl = await msalClient.getAuthCodeUrl(authCodeUrlParameters)

    // Return authorization URL for client-side redirect
    return NextResponse.json({
      success: true,
      authorizationUrl: authUrl,
    })
  } catch (error) {
    console.error('Failed to initiate Outlook OAuth:', error)

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
