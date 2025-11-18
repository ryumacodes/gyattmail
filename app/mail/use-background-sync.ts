/**
 * Client-side hook for automatic background email synchronization
 * Polls the background sync endpoint every 15 minutes
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export interface BackgroundSyncOptions {
  enabled?: boolean // Enable automatic syncing (default: true)
  interval?: number // Sync interval in milliseconds (default: 15 minutes)
  onSyncComplete?: (data: any) => void
  onError?: (error: string) => void
  reloadEmails?: () => void // Callback to reload emails after sync
}

const DEFAULT_SYNC_INTERVAL = 15 * 60 * 1000 // 15 minutes

export function useBackgroundSync(options: BackgroundSyncOptions = {}) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [totalNewEmails, setTotalNewEmails] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  const {
    enabled = true,
    interval = DEFAULT_SYNC_INTERVAL,
    onSyncComplete,
    onError,
    reloadEmails,
  } = options

  const performSync = useCallback(async () => {
    if (!isMountedRef.current) return

    setIsSyncing(true)
    setError(null)

    try {
      const response = await fetch('/api/mail/sync/background', {
        method: 'POST',
      })

      const data = await response.json()

      if (!isMountedRef.current) return

      if (data.success) {
        setLastSyncTime(new Date())
        setTotalNewEmails((prev) => prev + (data.totalNewEmails || 0))
        onSyncComplete?.(data)

        // Reload emails from storage after successful sync
        if (reloadEmails) {
          reloadEmails()
        }
      } else {
        const errorMessage = data.error || 'Background sync failed'
        setError(errorMessage)
        onError?.(errorMessage)
      }
    } catch (err) {
      if (!isMountedRef.current) return

      const errorMessage = err instanceof Error ? err.message : 'Network error'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      if (isMountedRef.current) {
        setIsSyncing(false)
      }
    }
  }, [onSyncComplete, onError, reloadEmails])

  // Manual sync trigger
  const syncNow = useCallback(() => {
    performSync()
  }, [performSync])

  // Reset new emails count
  const resetNewEmailsCount = useCallback(() => {
    setTotalNewEmails(0)
  }, [])

  // Setup automatic syncing
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Perform initial sync after 5 seconds (to let the app load first)
    const initialSyncTimeout = setTimeout(() => {
      if (isMountedRef.current) {
        performSync()
      }
    }, 5000)

    // Setup periodic syncing
    intervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        performSync()
      }
    }, interval)

    return () => {
      clearTimeout(initialSyncTimeout)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, interval, performSync])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return {
    isSyncing,
    lastSyncTime,
    error,
    totalNewEmails,
    syncNow,
    resetNewEmailsCount,
    nextSyncIn: lastSyncTime
      ? Math.max(0, interval - (Date.now() - lastSyncTime.getTime()))
      : interval,
  }
}
