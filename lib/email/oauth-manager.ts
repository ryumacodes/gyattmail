/**
 * OAuth2 authentication manager for Gmail and Outlook
 * Handles token generation, refresh, and validation
 */

import { google } from 'googleapis'
import { ConfidentialClientApplication } from '@azure/msal-node'
import type { OAuth2Tokens } from '@/lib/types/email'

// ============================================================================
// Gmail OAuth2 (Google)
// ============================================================================

const googleOAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

/**
 * Exchange authorization code for access and refresh tokens
 *
 * @param code - Authorization code from OAuth callback
 * @param clientId - Optional client ID (uses env var if not provided)
 * @param clientSecret - Optional client secret (uses env var if not provided)
 * @returns OAuth2 tokens including access_token and refresh_token
 */
export async function getGmailTokensFromCode(
  code: string,
  clientId?: string,
  clientSecret?: string
): Promise<OAuth2Tokens> {
  // Use provided credentials or fall back to environment variables
  const oauth2Client = new google.auth.OAuth2(
    clientId || process.env.GOOGLE_CLIENT_ID,
    clientSecret || process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/gmail/callback`
  )

  const { tokens } = await oauth2Client.getToken(code)

  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error('Failed to obtain access or refresh token')
  }

  return tokens as OAuth2Tokens
}

/**
 * Get user email address from Google access token
 *
 * @param accessToken - Google OAuth2 access token
 * @returns User's email address
 */
export async function getGmailUserEmail(accessToken: string): Promise<string> {
  const oauth2 = google.oauth2({
    version: 'v2',
    auth: googleOAuth2Client,
  })

  googleOAuth2Client.setCredentials({ access_token: accessToken })

  const { data } = await oauth2.userinfo.get()

  if (!data.email) {
    throw new Error('Failed to get user email from Google')
  }

  return data.email
}

/**
 * Refresh Google access token using refresh token
 *
 * @param refreshToken - Google OAuth2 refresh token
 * @param clientId - Optional client ID (uses env var if not provided)
 * @param clientSecret - Optional client secret (uses env var if not provided)
 * @returns New access token
 */
export async function refreshGmailAccessToken(
  refreshToken: string,
  clientId?: string,
  clientSecret?: string
): Promise<string> {
  // Use provided credentials or fall back to environment variables
  const oauth2Client = new google.auth.OAuth2(
    clientId || process.env.GOOGLE_CLIENT_ID,
    clientSecret || process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  oauth2Client.setCredentials({ refresh_token: refreshToken })

  const { credentials } = await oauth2Client.refreshAccessToken()

  if (!credentials.access_token) {
    throw new Error('Failed to refresh access token')
  }

  return credentials.access_token
}

// ============================================================================
// Outlook OAuth2 (Microsoft)
// ============================================================================

function getMSALClient(clientId?: string, clientSecret?: string): ConfidentialClientApplication {
  return new ConfidentialClientApplication({
    auth: {
      clientId: clientId || process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: clientSecret || process.env.MICROSOFT_CLIENT_SECRET!,
      authority: 'https://login.microsoftonline.com/common',
    },
  })
}

/**
 * Exchange authorization code for access and refresh tokens
 *
 * @param code - Authorization code from OAuth callback
 * @param clientId - Optional client ID (uses env var if not provided)
 * @param clientSecret - Optional client secret (uses env var if not provided)
 * @returns OAuth2 tokens including access_token and refresh_token
 */
export async function getOutlookTokensFromCode(
  code: string,
  clientId?: string,
  clientSecret?: string
): Promise<OAuth2Tokens> {
  const msalClient = getMSALClient(clientId, clientSecret)

  const tokenRequest = {
    code,
    scopes: [
      'https://outlook.office.com/IMAP.AccessAsUser.All',
      'https://outlook.office.com/SMTP.Send',
      'https://outlook.office.com/User.Read',
      'offline_access',
    ],
    redirectUri: process.env.MICROSOFT_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/outlook/callback`,
  }

  const response = await msalClient.acquireTokenByCode(tokenRequest)

  if (!response || !response.accessToken) {
    throw new Error('Failed to obtain access token from Microsoft')
  }

  // MSAL doesn't expose refresh_token directly - it's managed internally in the token cache
  // For our use case, we'll store the account identifier as the "refresh token"
  // and use it later with acquireTokenSilent to get new access tokens
  const account = response.account
  if (!account) {
    throw new Error('No account information returned from Microsoft')
  }

  // Use account homeAccountId as a pseudo refresh token identifier
  const accountIdentifier = account.homeAccountId

  return {
    access_token: response.accessToken,
    refresh_token: accountIdentifier, // Store account ID to use for silent token refresh
    expiry_date: response.expiresOn ? response.expiresOn.getTime() : undefined,
    scope: response.scopes?.join(' '),
    token_type: response.tokenType,
  }
}

/**
 * Get user email address from Microsoft access token
 *
 * @param accessToken - Microsoft OAuth2 access token
 * @returns User's email address
 */
export async function getOutlookUserEmail(accessToken: string): Promise<string> {
  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get user info from Microsoft Graph')
  }

  const data = await response.json()

  if (!data.mail && !data.userPrincipalName) {
    throw new Error('Failed to get user email from Microsoft')
  }

  return data.mail || data.userPrincipalName
}

/**
 * Refresh Microsoft access token using refresh token
 *
 * @param refreshToken - Microsoft OAuth2 refresh token
 * @param clientId - Optional client ID (uses env var if not provided)
 * @param clientSecret - Optional client secret (uses env var if not provided)
 * @returns New access token
 */
export async function refreshOutlookAccessToken(
  refreshToken: string,
  clientId?: string,
  clientSecret?: string
): Promise<string> {
  const msalClient = getMSALClient(clientId, clientSecret)

  const tokenRequest = {
    refreshToken,
    scopes: [
      'https://outlook.office.com/IMAP.AccessAsUser.All',
      'https://outlook.office.com/SMTP.Send',
      'offline_access',
    ],
  }

  const response = await msalClient.acquireTokenByRefreshToken(tokenRequest)

  if (!response || !response.accessToken) {
    throw new Error('Failed to refresh Microsoft access token')
  }

  return response.accessToken
}

// ============================================================================
// Generic helpers
// ============================================================================

/**
 * Check if an access token is expired or about to expire
 *
 * @param expiryDate - Token expiry timestamp (milliseconds)
 * @param bufferMinutes - Consider token expired this many minutes before actual expiry
 * @returns true if token is expired or about to expire
 */
export function isTokenExpired(expiryDate: number | undefined, bufferMinutes = 5): boolean {
  if (!expiryDate) {
    return true
  }

  const now = Date.now()
  const bufferMs = bufferMinutes * 60 * 1000

  return expiryDate - bufferMs <= now
}
