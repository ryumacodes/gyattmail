import { redirect } from 'next/navigation'
import { getAllAccounts } from '@/lib/storage/account-storage'

export default async function Home() {
  // Check if user has any connected accounts
  const accounts = await getAllAccounts()

  if (accounts.length === 0) {
    redirect('/connect')
  } else {
    redirect('/mail')
  }

  return null
}
