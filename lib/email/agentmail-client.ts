import { AgentMailClient } from 'agentmail'
import type { EmailAccount, EmailAddress, EmailMessage, SendEmailRequest } from '@/lib/types/email'
import { decrypt } from '@/lib/storage/encryption'

function clientFor(account: EmailAccount): AgentMailClient {
  if (!account.agentMailApiKey) throw new Error('AgentMail account is missing its API key')
  return new AgentMailClient({ apiKey: decrypt(account.agentMailApiKey) })
}

function inboxFor(account: EmailAccount): string {
  return account.agentMailInboxId || account.email
}

function parseAddress(value: string): EmailAddress {
  const match = value.match(/^\s*(.*?)\s*<([^>]+)>\s*$/)
  return match
    ? { name: match[1].replace(/^['"]|['"]$/g, ''), address: match[2] }
    : { name: value.split('@')[0], address: value }
}

function stableUid(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0
  return Math.abs(hash) || 1
}

function folderFromLabels(labels: string[]): string {
  if (labels.includes('trash')) return 'Trash'
  if (labels.includes('spam')) return 'Spam'
  if (labels.includes('sent')) return 'Sent'
  if (labels.includes('draft')) return 'Drafts'
  if (labels.includes('archived') || labels.includes('archive')) return 'Archive'
  return 'INBOX'
}

export async function listAgentMailMessages(account: EmailAccount, limit = 100): Promise<EmailMessage[]> {
  const client = clientFor(account)
  const inboxId = inboxFor(account)
  const response = await client.inboxes.messages.list(inboxId, {
    limit: Math.min(limit, 100),
    includeTrash: true,
    includeSpam: true,
  })

  return Promise.all(response.messages.map(async (item) => {
    const full = await client.inboxes.messages.get(inboxId, item.messageId)
    const labels = [...full.labels]
    const text = 'text' in full && typeof full.text === 'string' ? full.text : undefined
    const html = 'html' in full && typeof full.html === 'string' ? full.html : undefined
    const replyTo = 'replyTo' in full && Array.isArray(full.replyTo)
      ? full.replyTo.filter((value): value is string => typeof value === 'string')
      : undefined
    const folder = folderFromLabels(labels)
    const uid = stableUid(full.messageId)
    return {
      id: `${account.id}:${folder}:${uid}`,
      accountId: account.id,
      uid,
      folder,
      messageId: full.messageId,
      threadId: full.threadId,
      remoteMessageId: full.messageId,
      remoteThreadId: full.threadId,
      from: [parseAddress(full.from)],
      to: full.to.map(parseAddress),
      cc: full.cc?.map(parseAddress),
      bcc: full.bcc?.map(parseAddress),
      replyTo: replyTo?.map(parseAddress),
      subject: full.subject || '(No Subject)',
      date: full.timestamp.toISOString(),
      text,
      html,
      snippet: full.preview || text?.slice(0, 200) || '',
      flags: labels.includes('read') ? ['\\Seen'] : [],
      labels,
      size: full.size,
      attachments: (full.attachments || []).map((attachment) => ({
        id: attachment.attachmentId,
        filename: attachment.filename || 'attachment',
        contentType: attachment.contentType || 'application/octet-stream',
        size: attachment.size,
      })),
      isRead: labels.includes('read') || !labels.includes('unread'),
      isStarred: labels.includes('starred'),
      syncedAt: new Date().toISOString(),
    }
  }))
}

export async function sendAgentMail(account: EmailAccount, request: SendEmailRequest) {
  const client = clientFor(account)
  return client.inboxes.messages.send(inboxFor(account), {
    to: Array.isArray(request.to) ? request.to : [request.to],
    cc: request.cc,
    bcc: request.bcc,
    subject: request.subject,
    text: request.text,
    html: request.html,
    replyTo: request.replyTo ? [request.replyTo] : undefined,
    attachments: request.attachments?.flatMap((attachment) => attachment.content ? [{
      filename: attachment.filename,
      content: attachment.content,
      contentType: attachment.contentType,
    }] : []),
  })
}

export async function updateAgentMailLabels(
  account: EmailAccount,
  messageId: string,
  addLabels: string[] = [],
  removeLabels: string[] = []
) {
  return clientFor(account).inboxes.messages.update(inboxFor(account), messageId, { addLabels, removeLabels })
}

export async function deleteAgentMailMessage(account: EmailAccount, messageId: string) {
  return clientFor(account).inboxes.messages.delete(inboxFor(account), messageId)
}

export async function getAgentMailAttachment(
  account: EmailAccount,
  messageId: string,
  attachmentId: string
) {
  return clientFor(account).inboxes.messages.getAttachment(inboxFor(account), messageId, attachmentId)
}
