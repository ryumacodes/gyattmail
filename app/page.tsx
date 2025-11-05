import { redirect } from 'next/navigation'
import { accounts } from '@/app/mail/data'

export default function Home() {
  // Check if user has any connected accounts
  // TODO: Replace with real account check from backend/database
  if (accounts.length === 0) {
    redirect('/connect')
  } else {
    redirect('/mail')
  }

  return null
}
