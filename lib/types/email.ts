/**
 * Email account types and interfaces for SMTP/IMAP email client
 */

export type EmailProvider = 'gmail' | 'outlook' | 'custom'
export type AuthType = 'oauth2' | 'password'
export type ConnectionStatus = 'connected' | 'failed' | 'reconnecting'

/**
 * Email account with authentication details
 * OAuth2 tokens and passwords are stored encrypted
 */
export interface EmailAccount {
  id: string
  email: string
  provider: EmailProvider
  authType: AuthType

  // OAuth2 fields (stored encrypted)
  accessToken?: string
  refreshToken?: string
  tokenExpiry?: number
  oauthClientId?: string // Stored encrypted - needed for token refresh
  oauthClientSecret?: string // Stored encrypted - needed for token refresh

  // Custom SMTP fields (stored encrypted)
  smtpHost?: string
  smtpPort?: number
  smtpUser?: string
  smtpPassword?: string
  smtpSecure?: boolean // true for port 465, false for 587

  // Custom IMAP fields (stored encrypted)
  imapHost?: string
  imapPort?: number
  imapUser?: string
  imapPassword?: string
  imapSecure?: boolean // true for port 993

  // UI/display fields
  label: string
  connectionStatus: ConnectionStatus
  lastError?: string
  lastSyncedAt?: string
  createdAt: string
}

/**
 * Request to send an email
 */
export interface SendEmailRequest {
  accountId: string
  to: string | string[]
  subject: string
  html?: string
  text?: string
  cc?: string[]
  bcc?: string[]
  replyTo?: string
  inReplyTo?: string // Message-ID of the email being replied to
  references?: string[] // Message-IDs for threading
  attachments?: EmailAttachment[]
}

/**
 * Email attachment
 */
export interface EmailAttachment {
  filename: string
  content: string // base64 encoded
  contentType: string
  size?: number
}

/**
 * Response from send email endpoint
 */
export interface SendEmailResponse {
  success: boolean
  messageId?: string
  error?: string
  details?: string
}

/**
 * OAuth2 tokens from Google/Microsoft
 */
export interface OAuth2Tokens {
  access_token: string
  refresh_token?: string
  expiry_date?: number
  scope?: string
  token_type?: string
}

/**
 * Email message structure (for IMAP)
 */
export interface EmailMessage {
  id: string // Unique ID (UID + accountId)
  accountId: string // Which account owns this email
  uid: number // IMAP UID
  folder: string // Mailbox name (INBOX, Sent, etc.)
  messageId: string // RFC 2822 Message-ID
  threadId?: string // For threading

  // Headers
  from: EmailAddress[]
  to: EmailAddress[]
  cc?: EmailAddress[]
  bcc?: EmailAddress[]
  replyTo?: EmailAddress[]
  subject: string
  date: string // ISO 8601

  // Content
  text?: string // Plain text body
  html?: string // HTML body
  snippet?: string // First 200 chars for list view

  // Metadata
  flags: string[] // \Seen, \Flagged, \Draft, etc.
  labels?: string[] // Gmail labels
  size: number // Bytes
  attachments: EmailAttachment[]

  // Client-side fields
  isRead: boolean // Derived from \Seen flag
  isStarred: boolean // Derived from \Flagged
  repliedTo?: boolean // For follow-up reminders
  snoozeUntil?: string // For snoozing

  // Sync tracking
  syncedAt: string // When we last synced this email
}

/**
 * Email address with name
 */
export interface EmailAddress {
  name: string
  address: string
}

/**
 * IMAP folder/mailbox structure
 */
export interface IMAPFolder {
  name: string
  path: string
  delimiter: string
  flags: string[]
  specialUse?: string // e.g., '\Sent', '\Trash', '\Drafts'
  exists: number // Number of messages
  recent: number // Number of recent messages
  unseen: number // Number of unseen messages
}

/**
 * Sync state for incremental synchronization
 * Tracks the sync progress for each folder of each account
 */
export interface SyncState {
  accountId: string
  folder: string
  uidValidity: number // Mailbox UIDVALIDITY
  lastSeenUid: number // Highest UID we've synced
  lastSyncedAt: string // ISO 8601 timestamp
}

/**
 * Connection test result
 */
export interface ConnectionTestResult {
  success: boolean
  smtpConnected?: boolean
  imapConnected?: boolean
  error?: string
  details?: string
}

/**
 * Fetch emails request
 */
export interface FetchEmailsRequest {
  accountId: string
  folder?: string // Default: INBOX
  limit?: number // Default: 50
  offset?: number // For pagination
}

/**
 * Fetch emails response
 */
export interface FetchEmailsResponse {
  success: boolean
  emails?: EmailMessage[]
  total?: number
  error?: string
  details?: string
}
