// Initial empty mails array - will be populated from IMAP sync
export const mails: Mail[] = []

// Explicit type with optional fields to allow runtime updates
export interface Mail {
  id: string
  name: string
  email: string
  subject: string
  text: string
  date: string
  read: boolean
  labels: string[]
  archived: boolean
  deleted: boolean
  starred: boolean
  repliedTo?: boolean
  snoozeUntil?: string
  threadId?: string
  messageCount?: number
  participants?: Array<{ name: string; email: string }>
  attachments?: Array<{ name: string; size: number; type: string; icsContent?: string }>
}

// Account interface
export interface Account {
  label: string
  email: string
  icon: React.ReactNode
  connectionStatus: 'connected' | 'failed' | 'reconnecting'
}

// NOTE: Set accounts to empty array [] for first-run experience
// When accounts.length === 0, root page redirects to /connect
// Accounts will be populated from the /api/accounts endpoint after OAuth
export const accounts: Account[] = []

// Contact interface
export interface Contact {
  name: string
  email: string
}

// Contacts will be extracted from email history
export const contacts: Contact[] = []
