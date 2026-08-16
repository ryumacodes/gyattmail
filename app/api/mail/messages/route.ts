import { NextRequest, NextResponse } from 'next/server'
import type { EmailMessage, MailMutationRequest } from '@/lib/types/email'
import { getAccount } from '@/lib/storage/account-storage'
import {
  getEmail,
  loadAllEmails,
  moveStoredEmail,
  removeStoredEmail,
  updateEmailFlags,
  updateEmailMetadata,
} from '@/lib/storage/email-storage'
import {
  moveMessage,
  permanentlyDeleteMessage,
  updateMessageFlags,
  updateMessageLabels,
} from '@/lib/email/imap-client'
import { deleteAgentMailMessage, updateAgentMailLabels } from '@/lib/email/agentmail-client'
import { getMutationFolder } from '@/lib/email/folder-helpers'

async function resolveEmail(emailId: string): Promise<EmailMessage | null> {
  const direct = await getEmail(emailId)
  if (direct) return direct
  const parts = emailId.split(':')
  if (parts.length < 3) return null
  const accountId = parts[0]
  const uid = Number(parts.at(-1))
  return (await loadAllEmails(accountId)).find((email) => email.uid === uid) || null
}

async function mutateOne(emailId: string, mutation: MailMutationRequest) {
  const email = await resolveEmail(emailId)
  if (!email) throw new Error('Message is not available in the local cache')
  const account = await getAccount(email.accountId)
  if (!account) throw new Error('Account not found')
  const remoteId = email.remoteMessageId || email.messageId

  if (['read', 'unread', 'star', 'unstar'].includes(mutation.action)) {
    const read = mutation.action === 'read' ? true : mutation.action === 'unread' ? false : undefined
    const starred = mutation.action === 'star' ? true : mutation.action === 'unstar' ? false : undefined
    if (account.provider === 'agentmail') {
      await updateAgentMailLabels(account, remoteId,
        [...(read === true ? ['read'] : []), ...(read === false ? ['unread'] : []), ...(starred === true ? ['starred'] : [])],
        [...(read === true ? ['unread'] : []), ...(read === false ? ['read'] : []), ...(starred === false ? ['starred'] : [])])
    } else {
      await updateMessageFlags(account, email.folder, email.uid, { read, starred })
    }
    await updateEmailFlags(email.id, { isRead: read, isStarred: starred })
    return
  }

  if (mutation.action === 'labels') {
    const add = mutation.addLabels || []
    const remove = mutation.removeLabels || []
    if (account.provider === 'agentmail') await updateAgentMailLabels(account, remoteId, add, remove)
    else await updateMessageLabels(account, email.folder, email.uid, add, remove)
    await updateEmailMetadata(email.id, {
      labels: [...new Set([...(email.labels || []).filter((label) => !remove.includes(label)), ...add])],
    })
    return
  }

  if (mutation.action === 'snooze') {
    await updateEmailMetadata(email.id, { snoozeUntil: mutation.snoozeUntil || undefined })
    return
  }

  if (mutation.action === 'delete-permanently') {
    if (account.provider === 'agentmail') await deleteAgentMailMessage(account, remoteId)
    else await permanentlyDeleteMessage(account, email.folder, email.uid)
    await removeStoredEmail(email.id)
    return
  }

  let targetFolder: string | undefined
  switch (mutation.action) {
    case 'move':
      targetFolder = mutation.targetFolder
      break
    case 'archive':
    case 'trash':
    case 'restore':
    case 'spam':
      targetFolder = getMutationFolder(account.provider, mutation.action)
      break
    default:
      throw new Error(`Unsupported mail action: ${mutation.action}`)
  }
  if (!targetFolder) throw new Error('A target folder is required')

  if (account.provider === 'agentmail') {
    const label = mutation.action === 'restore' ? 'inbox' : mutation.action
    const remove = mutation.action === 'restore' ? ['trash', 'spam', 'archived', 'archive'] : ['inbox']
    await updateAgentMailLabels(account, remoteId, [label], remove)
  } else {
    await moveMessage(account, email.folder, targetFolder, email.uid)
  }
  await moveStoredEmail(email.id, targetFolder)
}

export async function PATCH(request: NextRequest) {
  try {
    const mutation = await request.json() as MailMutationRequest
    if (!Array.isArray(mutation.emailIds) || mutation.emailIds.length === 0 || !mutation.action) {
      return NextResponse.json({ error: 'emailIds and action are required' }, { status: 400 })
    }
    const results = await Promise.allSettled(mutation.emailIds.map((id) => mutateOne(id, mutation)))
    const failures = results.flatMap((result, index) => result.status === 'rejected'
      ? [{ emailId: mutation.emailIds[index], error: result.reason instanceof Error ? result.reason.message : 'Unknown error' }]
      : [])
    return NextResponse.json({ success: failures.length === 0, updated: results.length - failures.length, failures }, {
      status: failures.length === results.length ? 502 : 200,
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update mail' }, { status: 500 })
  }
}
