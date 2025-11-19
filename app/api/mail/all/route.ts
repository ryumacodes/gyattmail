/**
 * Fetch all emails from all accounts API endpoint
 * Returns merged emails from all connected accounts across all folders
 */

import { NextResponse } from 'next/server'
import { getAllAccounts } from '@/lib/storage/account-storage'
import { loadEmails } from '@/lib/storage/email-storage'
import { getStandardFolders } from '@/lib/email/folder-helpers'
import type { EmailMessage } from '@/lib/types/email'

export async function GET() {
  try {
    // Get all accounts
    const accounts = await getAllAccounts()

    if (accounts.length === 0) {
      return NextResponse.json({
        success: true,
        emails: [],
        total: 0,
      })
    }

    // Fetch emails from all accounts and all folders in parallel
    const emailPromises = accounts.flatMap((account) => {
      // Get all standard folders for this account's provider
      const folders = getStandardFolders(account.provider)

      // Create a promise for each folder
      return folders.map(async (folder) => {
        try {
          const emails = await loadEmails(account.id, folder)
          return emails
        } catch (error) {
          // Folder might not exist for this account - that's okay
          console.error(`Failed to load ${folder} for ${account.email}:`, error)
          return []
        }
      })
    })

    const allFolderEmails = await Promise.all(emailPromises)

    // Flatten and merge all emails from all accounts and folders
    const mergedEmails = allFolderEmails.flat()

    // Deduplicate emails by ID (in case same email appears in multiple folders)
    const uniqueEmails = Array.from(
      new Map(mergedEmails.map((email) => [email.id, email])).values()
    )

    // Sort by date (newest first)
    uniqueEmails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({
      success: true,
      emails: uniqueEmails,
      total: uniqueEmails.length,
    })
  } catch (error) {
    console.error('Fetch all emails error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch emails',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
