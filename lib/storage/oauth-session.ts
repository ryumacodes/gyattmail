/**
 * Temporary session storage for OAuth credentials
 * Stores client credentials server-side during OAuth flow
 * Uses filesystem for durability across serverless deployments
 */

import crypto from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'

interface OAuthSession {
  clientId: string
  clientSecret: string
  provider: 'gmail' | 'outlook'
  createdAt: number
}

// Session TTL: 5 minutes (enough time for OAuth flow)
const SESSION_TTL = 5 * 60 * 1000
const SESSIONS_DIR = path.join(process.cwd(), '.data', 'oauth-sessions')

/**
 * Ensure sessions directory exists
 */
async function ensureSessionsDir(): Promise<void> {
  try {
    await fs.mkdir(SESSIONS_DIR, { recursive: true, mode: 0o700 })
  } catch (error) {
    console.error('Failed to create sessions directory:', error)
  }
}

/**
 * Generate a secure random session ID
 */
function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Clean up expired sessions
 */
async function cleanupExpiredSessions(): Promise<void> {
  try {
    await ensureSessionsDir()
    const files = await fs.readdir(SESSIONS_DIR)
    const now = Date.now()

    for (const file of files) {
      if (!file.endsWith('.json')) continue

      const filePath = path.join(SESSIONS_DIR, file)
      try {
        const data = await fs.readFile(filePath, 'utf-8')
        const session: OAuthSession = JSON.parse(data)

        if (now - session.createdAt > SESSION_TTL) {
          await fs.unlink(filePath)
        }
      } catch (error) {
        // If file is corrupted or unreadable, delete it
        await fs.unlink(filePath).catch(() => {})
      }
    }
  } catch (error) {
    console.error('Failed to cleanup sessions:', error)
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
export async function createOAuthSession(
  provider: 'gmail' | 'outlook',
  clientId: string,
  clientSecret: string
): Promise<string> {
  await ensureSessionsDir()

  // Cleanup in background (don't await)
  cleanupExpiredSessions().catch(console.error)

  const sessionId = generateSessionId()
  const session: OAuthSession = {
    clientId,
    clientSecret,
    provider,
    createdAt: Date.now(),
  }

  const sessionPath = path.join(SESSIONS_DIR, `${sessionId}.json`)
  await fs.writeFile(sessionPath, JSON.stringify(session), { mode: 0o600 })

  return sessionId
}

/**
 * Retrieve and delete OAuth credentials from session
 *
 * @param sessionId - Session ID from OAuth state parameter
 * @returns OAuth credentials or null if not found/expired
 */
export async function consumeOAuthSession(sessionId: string): Promise<OAuthSession | null> {
  const sessionPath = path.join(SESSIONS_DIR, `${sessionId}.json`)

  try {
    const data = await fs.readFile(sessionPath, 'utf-8')
    const session: OAuthSession = JSON.parse(data)

    // Check if expired
    if (Date.now() - session.createdAt > SESSION_TTL) {
      await fs.unlink(sessionPath).catch(() => {})
      return null
    }

    // Delete after retrieval (one-time use)
    await fs.unlink(sessionPath).catch(() => {})

    return session
  } catch (error) {
    // Session not found or error reading
    return null
  }
}

/**
 * Get session count for monitoring
 */
export async function getSessionCount(): Promise<number> {
  try {
    await ensureSessionsDir()
    const files = await fs.readdir(SESSIONS_DIR)
    return files.filter(f => f.endsWith('.json')).length
  } catch (error) {
    return 0
  }
}
