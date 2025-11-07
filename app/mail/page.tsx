import { cookies } from "next/headers"
import { getAllAccounts } from "@/lib/storage/account-storage"
import { Mail } from "@/app/mail/components/mail"
import type { Account } from "@/app/mail/data"

// Provider icons
const GmailIcon = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <title>Gmail</title>
    <path
      d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
      fill="currentColor"
    />
  </svg>
)

const OutlookIcon = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <title>Outlook</title>
    <path
      d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V10q0 .41-.3.7-.3.3-.75.3H19v1.3zm-16.09-.14H6.72q-.3 0-.5.2-.2.21-.2.5v.86q0 .3.2.5.2.2.5.2h1.19q.3 0 .5-.2.2-.2.2-.5v-.86q0-.3-.2-.5-.2-.2-.5-.2zm11.09 0h-1.19q-.3 0-.5.2-.2.21-.2.5v.86q0 .3.2.5.2.2.5.2h1.19q.3 0 .5-.2.2-.2.2-.5v-.86q0-.3-.2-.5-.2-.2-.5-.2z"
      fill="currentColor"
    />
  </svg>
)

const iCloudIcon = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <title>iCloud</title>
    <path
      d="M13.762 4.29a6.51 6.51 0 0 0-5.669 3.332 3.571 3.571 0 0 0-1.558-.36 3.571 3.571 0 0 0-3.516 3A4.918 4.918 0 0 0 0 14.796a4.918 4.918 0 0 0 4.92 4.914 4.93 4.93 0 0 0 .617-.045h14.42c2.305-.272 4.041-2.258 4.043-4.589v-.009a4.594 4.594 0 0 0-3.727-4.508 6.51 6.51 0 0 0-6.511-6.27z"
      fill="currentColor"
    />
  </svg>
)

const CustomIcon = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <title>Email</title>
    <path
      d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
      fill="currentColor"
    />
  </svg>
)

export default async function MailPage() {
  // Fetch real accounts from storage
  const storedAccounts = await getAllAccounts()

  // Redirect to connect page if no accounts
  if (storedAccounts.length === 0) {
    const { redirect } = await import('next/navigation')
    redirect('/connect')
  }

  const cookieStore = await cookies()
  const layout = cookieStore.get("react-resizable-panels:layout:mail")
  const collapsed = cookieStore.get("react-resizable-panels:collapsed")

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined

  // Transform to UI Account format
  const accounts: Account[] = storedAccounts.map((acc) => {
    let icon
    switch (acc.provider) {
      case 'gmail':
        icon = <GmailIcon />
        break
      case 'outlook':
        icon = <OutlookIcon />
        break
      case 'custom':
        // Check if it's iCloud based on email domain
        if (acc.email.endsWith('@icloud.com') || acc.email.endsWith('@me.com') || acc.email.endsWith('@mac.com')) {
          icon = <iCloudIcon />
        } else {
          icon = <CustomIcon />
        }
        break
      default:
        icon = <CustomIcon />
    }

    return {
      label: acc.label || acc.email.split('@')[0],
      email: acc.email,
      icon,
      connectionStatus: acc.connectionStatus,
    }
  })

  return (
    <div className="flex-col flex h-screen">
      <Mail
        accounts={accounts}
        defaultLayout={defaultLayout}
        defaultCollapsed={defaultCollapsed}
        navCollapsedSize={4}
      />
    </div>
  )
}
