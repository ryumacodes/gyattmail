/**
 * Account storage layer for email accounts
 * Uses file-based JSON storage (replace with database in production)
 * All sensitive fields are encrypted before storage
 */

import fs from 'fs/promises'
import path from 'path'
import type { EmailAccount } from '@/lib/types/email'

// Storage file path (in production, use a database instead)
const STORAGE_DIR = path.join(process.cwd(), '.data')
const ACCOUNTS_FILE = path.join(STORAGE_DIR, 'accounts.json')

/**
 * Ensure storage directory and file exist
 */
async function ensureStorageExists(): Promise<void> {
  try {
    await fs.access(STORAGE_DIR)
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true })
  }

  try {
    await fs.access(ACCOUNTS_FILE)
  } catch {
    await fs.writeFile(ACCOUNTS_FILE, JSON.stringify([]), 'utf-8')
  }
}

/**
 * Read all accounts from storage
 *
 * @returns Array of email accounts
 */
export async function getAllAccounts(): Promise<EmailAccount[]> {
  await ensureStorageExists()

  const data = await fs.readFile(ACCOUNTS_FILE, 'utf-8')
  return JSON.parse(data) as EmailAccount[]
}

/**
 * Get a single account by ID
 *
 * @param accountId - Account ID
 * @returns Email account or null if not found
 */
export async function getAccount(accountId: string): Promise<EmailAccount | null> {
  const accounts = await getAllAccounts()
  return accounts.find((acc) => acc.id === accountId) || null
}

/**
 * Get all accounts for a specific email address
 * Useful for checking if email is already connected
 *
 * @param email - Email address
 * @returns Array of accounts with this email
 */
export async function getAccountsByEmail(email: string): Promise<EmailAccount[]> {
  const accounts = await getAllAccounts()
  return accounts.filter((acc) => acc.email.toLowerCase() === email.toLowerCase())
}

/**
 * Save a new account or update existing one
 *
 * @param account - Email account to save
 * @returns Saved account
 */
export async function saveAccount(account: EmailAccount): Promise<EmailAccount> {
  const accounts = await getAllAccounts()

  // Check if account with same ID exists
  const existingIndex = accounts.findIndex((acc) => acc.id === account.id)

  if (existingIndex >= 0) {
    // Update existing account
    accounts[existingIndex] = account
  } else {
    // Add new account
    accounts.push(account)
  }

  await fs.writeFile(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), 'utf-8')

  return account
}

/**
 * Delete an account by ID
 *
 * @param accountId - Account ID to delete
 * @returns true if account was deleted, false if not found
 */
export async function deleteAccount(accountId: string): Promise<boolean> {
  const accounts = await getAllAccounts()
  const initialLength = accounts.length

  const filtered = accounts.filter((acc) => acc.id !== accountId)

  if (filtered.length === initialLength) {
    return false // Account not found
  }

  await fs.writeFile(ACCOUNTS_FILE, JSON.stringify(filtered, null, 2), 'utf-8')

  return true
}

/**
 * Update account connection status
 *
 * @param accountId - Account ID
 * @param status - New connection status
 * @param error - Optional error message
 * @returns Updated account or null if not found
 */
export async function updateAccountStatus(
  accountId: string,
  status: 'connected' | 'failed' | 'reconnecting',
  error?: string
): Promise<EmailAccount | null> {
  const accounts = await getAllAccounts()
  const account = accounts.find((acc) => acc.id === accountId)

  if (!account) {
    return null
  }

  account.connectionStatus = status
  account.lastError = error

  await saveAccount(account)

  return account
}

/**
 * Update account last synced timestamp
 *
 * @param accountId - Account ID
 * @returns Updated account or null if not found
 */
export async function updateLastSynced(accountId: string): Promise<EmailAccount | null> {
  const accounts = await getAllAccounts()
  const account = accounts.find((acc) => acc.id === accountId)

  if (!account) {
    return null
  }

  account.lastSyncedAt = new Date().toISOString()

  await saveAccount(account)

  return account
}

/**
 * Update OAuth2 tokens for an account
 *
 * @param accountId - Account ID
 * @param accessToken - New encrypted access token
 * @param refreshToken - New encrypted refresh token (optional)
 * @param tokenExpiry - Token expiry timestamp
 * @returns Updated account or null if not found
 */
export async function updateAccountTokens(
  accountId: string,
  accessToken: string,
  refreshToken?: string,
  tokenExpiry?: number
): Promise<EmailAccount | null> {
  const accounts = await getAllAccounts()
  const account = accounts.find((acc) => acc.id === accountId)

  if (!account) {
    return null
  }

  account.accessToken = accessToken

  if (refreshToken) {
    account.refreshToken = refreshToken
  }

  if (tokenExpiry) {
    account.tokenExpiry = tokenExpiry
  }

  await saveAccount(account)

  return account
}

/**
 * Get count of accounts by provider
 *
 * @returns Object with counts per provider
 */
export async function getAccountCountsByProvider(): Promise<Record<string, number>> {
  const accounts = await getAllAccounts()

  const counts: Record<string, number> = {
    gmail: 0,
    outlook: 0,
    custom: 0,
  }

  for (const account of accounts) {
    counts[account.provider] = (counts[account.provider] || 0) + 1
  }

  return counts
}
