/**
 * File-based sync state storage
 * Tracks UIDVALIDITY and last synced UID for incremental sync
 * Stored in .data/sync-state.json
 */

import { promises as fs } from 'fs'
import path from 'path'
import type { SyncState } from '@/lib/types/email'

const SYNC_STATE_FILE = path.join(process.cwd(), '.data', 'sync-state.json')

/**
 * Ensure the .data directory exists
 */
async function ensureDataDir(): Promise<void> {
  const dataDir = path.dirname(SYNC_STATE_FILE)
  await fs.mkdir(dataDir, { recursive: true })
}

/**
 * Load all sync states
 */
async function loadAllSyncStates(): Promise<SyncState[]> {
  try {
    const data = await fs.readFile(SYNC_STATE_FILE, 'utf-8')
    return JSON.parse(data) as SyncState[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [] // File doesn't exist yet
    }
    throw error
  }
}

/**
 * Save all sync states
 */
async function saveAllSyncStates(states: SyncState[]): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(SYNC_STATE_FILE, JSON.stringify(states, null, 2), 'utf-8')
}

/**
 * Get sync state for a specific account and folder
 */
export async function getSyncState(
  accountId: string,
  folder: string
): Promise<SyncState | null> {
  const states = await loadAllSyncStates()
  return states.find((s) => s.accountId === accountId && s.folder === folder) || null
}

/**
 * Save or update sync state for a specific account and folder
 */
export async function saveSyncState(syncState: SyncState): Promise<void> {
  const states = await loadAllSyncStates()
  const index = states.findIndex(
    (s) => s.accountId === syncState.accountId && s.folder === syncState.folder
  )

  if (index >= 0) {
    states[index] = syncState
  } else {
    states.push(syncState)
  }

  await saveAllSyncStates(states)
}

/**
 * Update sync state with new highest UID
 */
export async function updateSyncState(
  accountId: string,
  folder: string,
  uidValidity: number,
  lastSeenUid: number
): Promise<void> {
  const syncState: SyncState = {
    accountId,
    folder,
    uidValidity,
    lastSeenUid,
    lastSyncedAt: new Date().toISOString(),
  }

  await saveSyncState(syncState)
}

/**
 * Check if UIDVALIDITY has changed (requires full resync)
 */
export async function hasUIDValidityChanged(
  accountId: string,
  folder: string,
  currentUidValidity: number
): Promise<boolean> {
  const syncState = await getSyncState(accountId, folder)

  // No previous sync state, so no change
  if (!syncState) return false

  // UIDVALIDITY changed
  return syncState.uidValidity !== currentUidValidity
}

/**
 * Reset sync state (for full resync)
 */
export async function resetSyncState(accountId: string, folder: string): Promise<void> {
  const states = await loadAllSyncStates()
  const filtered = states.filter(
    (s) => !(s.accountId === accountId && s.folder === folder)
  )
  await saveAllSyncStates(filtered)
}

/**
 * Delete all sync states for an account
 */
export async function deleteAccountSyncStates(accountId: string): Promise<void> {
  const states = await loadAllSyncStates()
  const filtered = states.filter((s) => s.accountId !== accountId)
  await saveAllSyncStates(filtered)
}

/**
 * Get all sync states for an account
 */
export async function getAccountSyncStates(accountId: string): Promise<SyncState[]> {
  const states = await loadAllSyncStates()
  return states.filter((s) => s.accountId === accountId)
}

/**
 * Get last sync time for an account (most recent across all folders)
 */
export async function getLastSyncTime(accountId: string): Promise<string | null> {
  const states = await getAccountSyncStates(accountId)

  if (states.length === 0) return null

  // Find most recent sync
  const mostRecent = states.reduce((latest, current) => {
    return new Date(current.lastSyncedAt) > new Date(latest.lastSyncedAt) ? current : latest
  })

  return mostRecent.lastSyncedAt
}
