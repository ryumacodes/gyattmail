/**
 * Fetch all emails from all accounts API endpoint
 * Returns merged emails from all connected accounts across all folders
 */

import { NextResponse } from 'next/server'
import { getAllAccounts } from '@/lib/storage/account-storage'
import { addEmails, loadAllEmails } from '@/lib/storage/email-storage'
import { listAgentMailMessages } from '@/lib/email/agentmail-client'
import { processDueDrafts } from '@/lib/email/scheduled-send'
import { listDrafts } from '@/lib/storage/draft-storage'
import { getMailPreferences } from '@/lib/storage/mail-preferences-storage'
import { matchesSearchQuery } from '@/app/mail/utils/search-query'
import { transformEmailToMail } from '@/lib/utils/email-transformer'
import type { EmailMessage } from '@/lib/types/email'

export async function GET() {
  try {
    await processDueDrafts()
    const accounts = await getAllAccounts()

    if (accounts.length === 0) {
      return NextResponse.json({
        success: true,
        emails: [],
        total: 0,
      })
    }

    const emailPromises = accounts.map(async (account) => {
      if (account.provider === 'agentmail') {
        try {
          const messages = await listAgentMailMessages(account)
          for (const folder of new Set(messages.map((message) => message.folder))) {
            await addEmails(account.id, folder, messages.filter((message) => message.folder === folder))
          }
          return messages
        } catch (error) {
          console.error(`AgentMail refresh failed for ${account.email}:`, error)
        }
      }
      return loadAllEmails(account.id)
    })

    const allFolderEmails = await Promise.all(emailPromises)

    const accountById = new Map(accounts.map((account) => [account.id, account]))
    const storedDrafts = await listDrafts()
    const draftEmails: EmailMessage[] = storedDrafts.map((draft, index) => ({
      id: `${draft.accountId}:Drafts:${900000000 + index}`,
      accountId: draft.accountId,
      uid: 900000000 + index,
      folder: 'Drafts',
      messageId: `draft-${draft.id}`,
      from: [],
      to: draft.to.map((address) => ({ name: address.split('@')[0], address })),
      subject: draft.subject || '(No Subject)',
      date: draft.updatedAt,
      text: draft.text,
      html: draft.html,
      snippet: draft.text.slice(0, 200),
      flags: ['\\Draft'],
      labels: [draft.status === 'scheduled' ? 'Scheduled' : 'Drafts'],
      size: draft.text.length,
      attachments: draft.attachments,
      isRead: true,
      isStarred: false,
      syncedAt: draft.updatedAt,
    }))
    const mergedEmails = [...allFolderEmails.flat(), ...draftEmails].map((email) => ({
      ...email,
      provider: accountById.get(email.accountId)?.provider,
      ownerKind: accountById.get(email.accountId)?.ownerKind ?? 'human',
    }))

    let uniqueEmails = Array.from(
      new Map(mergedEmails.map((email) => [email.id, email])).values()
    )

    const preferences = await getMailPreferences()
    uniqueEmails = uniqueEmails.map((email) => {
      let next = email
      for (const rule of preferences.rules.filter((item) => item.enabled)) {
        if (!matchesSearchQuery(transformEmailToMail(next), rule.query)) continue
        next = {
          ...next,
          labels: rule.addLabel ? [...new Set([...(next.labels || []), rule.addLabel])] : next.labels,
          isRead: rule.markRead ?? next.isRead,
          flags: rule.markRead ? [...new Set([...next.flags, '\\Seen'])] : next.flags,
          folder: rule.archive ? 'Archive' : next.folder,
        }
      }
      return next
    })

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
