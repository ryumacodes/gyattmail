// Initial empty mails array - will be populated from IMAP sync
export const mails: Mail[] = []

// Explicit type with optional fields to allow runtime updates
export interface Mail {
  id: string
  accountId: string // Which account this email belongs to
  provider?: 'gmail' | 'outlook' | 'custom' | 'agentmail'
  ownerKind?: 'human' | 'agent'
  name: string
  email: string
  subject: string
  text: string
  html?: string // HTML content of email (if available)
  date: string
  read: boolean
  labels: string[]
  archived: boolean
  deleted: boolean
  starred: boolean
  repliedTo?: boolean
  snoozeUntil?: string
  threadId?: string
  messageId?: string
  messageCount?: number
  messageIds?: string[]
  threadMessages?: Mail[]
  participants?: Array<{ name: string; email: string }>
  attachments?: Array<{ id?: string; name: string; size: number; type: string; content?: string; downloadUrl?: string; icsContent?: string }>
}

// Account interface
export interface Account {
  id: string
  label: string
  email: string
  icon: React.ReactNode
  connectionStatus: 'connected' | 'failed' | 'reconnecting'
  provider?: 'gmail' | 'outlook' | 'custom' | 'agentmail'
  ownerKind?: 'human' | 'agent'
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
