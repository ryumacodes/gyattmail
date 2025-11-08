/**
 * Gmail OAuth2 callback endpoint
 * Exchanges authorization code for tokens and creates email account
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import {
  getGmailTokensFromCode,
  getGmailUserEmail,
} from '@/lib/email/oauth-manager'
import { saveAccount, getAccountsByEmail } from '@/lib/storage/account-storage'
import { encrypt } from '@/lib/storage/encryption'
import { consumeOAuthSession } from '@/lib/storage/oauth-session'
import type { EmailAccount } from '@/lib/types/email'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // User denied access
  if (error) {
    return NextResponse.redirect(
      new URL(`/mail?error=oauth_denied&provider=gmail`, request.url)
    )
  }

  // No authorization code provided
  if (!code) {
    return NextResponse.redirect(
      new URL(`/mail?error=oauth_failed&provider=gmail`, request.url)
    )
  }

  // No state parameter (session ID)
  if (!state) {
    return NextResponse.redirect(
      new URL(`/mail?error=oauth_failed&provider=gmail&details=Missing+state+parameter`, request.url)
    )
  }

  try {
    // Retrieve OAuth credentials from secure server-side session
    const session = await consumeOAuthSession(state)
    if (!session || session.provider !== 'gmail') {
      return NextResponse.redirect(
        new URL(`/mail?error=oauth_failed&provider=gmail&details=Invalid+or+expired+session`, request.url)
      )
    }

    // Exchange code for tokens using user-provided credentials
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/gmail/callback`
    const tokens = await getGmailTokensFromCode(code, session.clientId, session.clientSecret, redirectUri)

    // Get user email address
    const email = await getGmailUserEmail(tokens.access_token)

    // Check if account already exists
    const existingAccounts = await getAccountsByEmail(email)
    const gmailAccounts = existingAccounts.filter((acc) => acc.provider === 'gmail')

    // Create unique label for multiple accounts
    const accountNumber = gmailAccounts.length + 1
    const label = accountNumber === 1 ? email : `${email} (${accountNumber})`

    // Create new account
    const account: EmailAccount = {
      id: crypto.randomUUID(),
      email,
      provider: 'gmail',
      authType: 'oauth2',
      accessToken: encrypt(tokens.access_token),
      refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : undefined,
      tokenExpiry: tokens.expiry_date,
      oauthClientId: encrypt(session.clientId), // Store for token refresh
      oauthClientSecret: encrypt(session.clientSecret), // Store for token refresh
      label,
      connectionStatus: 'connected',
      createdAt: new Date().toISOString(),
    }

    // Save account
    await saveAccount(account)

    // Redirect back to mail page with success message
    return NextResponse.redirect(
      new URL(`/mail?account=added&email=${encodeURIComponent(email)}`, request.url)
    )
  } catch (error) {
    console.error('Gmail OAuth callback error:', error)

    return NextResponse.redirect(
      new URL(
        `/mail?error=oauth_failed&provider=gmail&details=${encodeURIComponent(
          error instanceof Error ? error.message : 'Unknown error'
        )}`,
        request.url
      )
    )
  }
}
