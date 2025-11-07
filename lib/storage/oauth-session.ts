/**
 * Temporary session storage for OAuth credentials
 * Stores client credentials server-side during OAuth flow
 * Uses in-memory cache with short TTL for security
 */

interface OAuthSession {
  clientId: string
  clientSecret: string
  provider: 'gmail' | 'outlook'
  createdAt: number
}

// In-memory cache (in production, use Redis or similar)
const sessions = new Map<string, OAuthSession>()

// Session TTL: 5 minutes (enough time for OAuth flow)
const SESSION_TTL = 5 * 60 * 1000

/**
 * Generate a secure random session ID
 */
function generateSessionId(): string {
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Clean up expired sessions
 */
function cleanupExpiredSessions(): void {
  const now = Date.now()
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.createdAt > SESSION_TTL) {
      sessions.delete(sessionId)
    }
  }
}

/**
 * Store OAuth credentials temporarily and return a session ID
 *
 * @param provider - OAuth provider (gmail or outlook)
 * @param clientId - OAuth client ID
 * @param clientSecret - OAuth client secret
 * @returns Session ID to use in OAuth state parameter
 */
export function createOAuthSession(
  provider: 'gmail' | 'outlook',
  clientId: string,
  clientSecret: string
): string {
  cleanupExpiredSessions()

  const sessionId = generateSessionId()
  sessions.set(sessionId, {
    clientId,
    clientSecret,
    provider,
    createdAt: Date.now(),
  })

  return sessionId
}

/**
 * Retrieve and delete OAuth credentials from session
 *
 * @param sessionId - Session ID from OAuth state parameter
 * @returns OAuth credentials or null if not found/expired
 */
export function consumeOAuthSession(sessionId: string): OAuthSession | null {
  cleanupExpiredSessions()

  const session = sessions.get(sessionId)
  if (!session) {
    return null
  }

  // Check if expired
  if (Date.now() - session.createdAt > SESSION_TTL) {
    sessions.delete(sessionId)
    return null
  }

  // Delete after retrieval (one-time use)
  sessions.delete(sessionId)
  return session
}

/**
 * Get session count for monitoring
 */
export function getSessionCount(): number {
  cleanupExpiredSessions()
  return sessions.size
}
