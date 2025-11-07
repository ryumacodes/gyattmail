import { redirect } from 'next/navigation'
import { getAllAccounts } from '@/lib/storage/account-storage'

export default async function Home() {
  // Check if user has any connected accounts with error handling
  let accounts
  try {
    accounts = await getAllAccounts()

    if (accounts.length === 0) {
      redirect('/connect')
    } else {
      redirect('/mail')
    }
  } catch (error) {
    console.error('Failed to load accounts:', error)
    // Redirect to connect page on error
    redirect('/connect')
  }

  return null
}
