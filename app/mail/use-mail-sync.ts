/**
 * Client-side hook for real-time email synchronization via SSE
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { SyncProgress } from '@/lib/email/sync-manager'

export interface SyncEvent {
  type: 'connected' | 'progress' | 'sync-start' | 'sync-complete' | 'account-complete' | 'error' | 'ping'
  data: any
}

export interface UseSyncOptions {
  accountId?: string // Optional: sync specific account
  autoConnect?: boolean // Auto-connect on mount (default: false)
  onProgress?: (progress: SyncProgress) => void
  onComplete?: (results: any) => void
  onError?: (error: string) => void
}

export function useMailSync(options: UseSyncOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<SyncProgress | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      return // Already connected
    }

    setError(null)
    setIsSyncing(true)

    // Build URL with optional accountId
    const url = options.accountId
      ? `/api/mail/sync/stream?accountId=${options.accountId}`
      : '/api/mail/sync/stream'

    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource

    eventSource.addEventListener('connected', (event) => {
      setIsConnected(true)
      console.log('SSE connected:', JSON.parse(event.data))
    })

    eventSource.addEventListener('progress', (event) => {
      const progressData: SyncProgress = JSON.parse(event.data)
      setProgress(progressData)
      options.onProgress?.(progressData)
    })

    eventSource.addEventListener('sync-start', (event) => {
      console.log('Sync started:', JSON.parse(event.data))
    })

    eventSource.addEventListener('sync-complete', (event) => {
      const results = JSON.parse(event.data)
      console.log('Sync complete:', results)
      setIsSyncing(false)
      options.onComplete?.(results)
      disconnect()
    })

    eventSource.addEventListener('account-complete', (event) => {
      console.log('Account sync complete:', JSON.parse(event.data))
    })

    eventSource.addEventListener('error', (event) => {
      const errorData = JSON.parse((event as MessageEvent).data || '{}')
      const errorMessage = errorData.error || 'Connection error'
      console.error('SSE error:', errorMessage)
      setError(errorMessage)
      setIsSyncing(false)
      options.onError?.(errorMessage)
      disconnect()
    })

    eventSource.addEventListener('ping', () => {
      // Keep-alive ping, no action needed
    })

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error)
      setError('Connection lost')
      setIsSyncing(false)
      setIsConnected(false)
      disconnect()
    }
  }, [options])

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
      setIsConnected(false)
    }
  }, [])

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (options.autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [options.autoConnect, connect, disconnect])

  return {
    isConnected,
    isSyncing,
    error,
    progress,
    connect,
    disconnect,
  }
}
