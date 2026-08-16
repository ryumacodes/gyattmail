import { useEffect, useCallback, useState } from 'react'
import { useMailData } from './use-mail-data'
import { transformEmailsToMails } from '@/lib/utils/email-transformer'
import type { EmailMessage } from '@/lib/types/email'

interface FetchAllEmailsResponse {
  success: boolean
  emails?: EmailMessage[]
  total?: number
  error?: string
  details?: string
}

/**
 * Hook to load emails from backend storage and populate the mail data atom
 * This bridges the gap between backend email storage and frontend UI state
 */
export function useLoadEmails() {
  const [, setMails] = useMailData()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEmails = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch all emails from all accounts using the new /api/mail/all endpoint
      const response = await fetch('/api/mail/all')

      if (!response.ok) {
        throw new Error(`Failed to fetch emails: ${response.statusText}`)
      }

      const data: FetchAllEmailsResponse = await response.json()

      if (!data.success || !data.emails) {
        throw new Error(data.error || 'Failed to fetch emails')
      }

      // Transform backend EmailMessage format to frontend Mail format
      const transformedMails = transformEmailsToMails(data.emails)

      // Update the mail data atom
      setMails(transformedMails)

      console.log(`✓ Loaded ${transformedMails.length} emails from ${data.total} total`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.error('Failed to load emails:', errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [setMails])

  // Load emails on mount
  useEffect(() => {
    loadEmails()
  }, [loadEmails])

  return {
    isLoading,
    error,
    reload: loadEmails,
  }
}
