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
import type { EmailAccount } from '@/lib/types/email'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
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

  try {
    // Exchange code for tokens
    const tokens = await getGmailTokensFromCode(code)

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
