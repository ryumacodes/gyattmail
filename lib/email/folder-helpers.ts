/**
 * Helper functions for working with email folders across different providers
 */

import type { EmailProvider } from '@/lib/types/email'

/**
 * Standard folder names by provider
 */
export const STANDARD_FOLDERS = {
  gmail: {
    inbox: 'INBOX',
    sent: '[Gmail]/Sent Mail',
    drafts: '[Gmail]/Drafts',
    trash: '[Gmail]/Trash',
    spam: '[Gmail]/Spam',
    starred: '[Gmail]/Starred',
    important: '[Gmail]/Important',
    allMail: '[Gmail]/All Mail',
  },
  outlook: {
    inbox: 'INBOX',
    sent: 'Sent Items',
    drafts: 'Drafts',
    trash: 'Deleted Items',
    spam: 'Junk Email',
    archive: 'Archive',
  },
  custom: {
    inbox: 'INBOX',
    sent: 'Sent',
    drafts: 'Drafts',
    trash: 'Trash',
    spam: 'Spam',
  },
}

/**
 * Get standard folders for a provider
 */
export function getStandardFolders(provider: EmailProvider): string[] {
  switch (provider) {
    case 'gmail':
      return [
        STANDARD_FOLDERS.gmail.inbox,
        STANDARD_FOLDERS.gmail.sent,
        STANDARD_FOLDERS.gmail.drafts,
        STANDARD_FOLDERS.gmail.trash,
        STANDARD_FOLDERS.gmail.allMail,
      ]
    case 'outlook':
      return [
        STANDARD_FOLDERS.outlook.inbox,
        STANDARD_FOLDERS.outlook.sent,
        STANDARD_FOLDERS.outlook.drafts,
        STANDARD_FOLDERS.outlook.trash,
      ]
    case 'custom':
      return [
        STANDARD_FOLDERS.custom.inbox,
        STANDARD_FOLDERS.custom.sent,
        STANDARD_FOLDERS.custom.drafts,
        STANDARD_FOLDERS.custom.trash,
      ]
  }
}

/**
 * Get essential folders (INBOX, Sent, Drafts) for quick sync
 */
export function getEssentialFolders(provider: EmailProvider): string[] {
  switch (provider) {
    case 'gmail':
      return [
        STANDARD_FOLDERS.gmail.inbox,
        STANDARD_FOLDERS.gmail.sent,
        STANDARD_FOLDERS.gmail.drafts,
      ]
    case 'outlook':
      return [
        STANDARD_FOLDERS.outlook.inbox,
        STANDARD_FOLDERS.outlook.sent,
        STANDARD_FOLDERS.outlook.drafts,
      ]
    case 'custom':
      return [
        STANDARD_FOLDERS.custom.inbox,
        STANDARD_FOLDERS.custom.sent,
        STANDARD_FOLDERS.custom.drafts,
      ]
  }
}

/**
 * Normalize folder name for display
 */
export function normalizeFolderName(folder: string): string {
  // Remove [Gmail]/ prefix
  if (folder.startsWith('[Gmail]/')) {
    return folder.replace('[Gmail]/', '')
  }

  // Map common folder names to friendly names
  const folderMap: Record<string, string> = {
    INBOX: 'Inbox',
    'Sent Items': 'Sent',
    'Sent Mail': 'Sent',
    Drafts: 'Drafts',
    'Deleted Items': 'Trash',
    Trash: 'Trash',
    'Junk Email': 'Spam',
    Spam: 'Spam',
    'All Mail': 'All Mail',
    Archive: 'Archive',
    Starred: 'Starred',
    Important: 'Important',
  }

  return folderMap[folder] || folder
}

/**
 * Get folder icon name (for UI)
 */
export function getFolderIcon(folder: string): string {
  const normalized = folder.toLowerCase()

  if (normalized.includes('inbox')) return 'inbox'
  if (normalized.includes('sent')) return 'send'
  if (normalized.includes('draft')) return 'file-edit'
  if (normalized.includes('trash') || normalized.includes('deleted')) return 'trash-2'
  if (normalized.includes('spam') || normalized.includes('junk')) return 'alert-octagon'
  if (normalized.includes('starred')) return 'star'
  if (normalized.includes('important')) return 'alert-circle'
  if (normalized.includes('archive')) return 'archive'
  if (normalized.includes('all')) return 'mail'

  return 'folder'
}
