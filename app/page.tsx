import { redirect } from 'next/navigation'
import { getAllAccounts } from '@/lib/storage/account-storage'

export default async function Home() {
  // Check if user has any connected accounts with error handling
  try {
    const accounts = await getAllAccounts()

    if (accounts.length === 0) {
      redirect('/connect')
    } else {
      redirect('/mail')
    }
  } catch (error) {
    // Re-throw NEXT_REDIRECT errors (they're not actual errors)
    if (error && typeof error === 'object' && 'digest' in error &&
        typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error
    }

    console.error('Failed to load accounts:', error)
    // Redirect to connect page on actual errors
    redirect('/connect')
  }

  return null
}
