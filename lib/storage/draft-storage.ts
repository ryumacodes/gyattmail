import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'
import type { MailDraft } from '@/lib/types/email'

const DATA_DIR = path.join(process.cwd(), '.data')
const FILE = path.join(DATA_DIR, 'drafts.json')

async function read(): Promise<MailDraft[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8')) as MailDraft[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

async function write(drafts: MailDraft[]) {
  await fs.mkdir(DATA_DIR, { recursive: true, mode: 0o700 })
  await fs.writeFile(FILE, JSON.stringify(drafts, null, 2), { mode: 0o600 })
  await fs.chmod(FILE, 0o600)
}

export async function listDrafts(accountId?: string) {
  const drafts = await read()
  return accountId ? drafts.filter((draft) => draft.accountId === accountId) : drafts
}

export async function saveDraft(input: Partial<MailDraft> & Pick<MailDraft, 'accountId'>): Promise<MailDraft> {
  const drafts = await read()
  const now = new Date().toISOString()
  const existing = input.id ? drafts.find((draft) => draft.id === input.id) : undefined
  const draft: MailDraft = {
    id: input.id || crypto.randomUUID(),
    accountId: input.accountId,
    to: input.to || [],
    cc: input.cc || [],
    bcc: input.bcc || [],
    subject: input.subject || '',
    text: input.text || '',
    html: input.html,
    attachments: input.attachments || [],
    inReplyTo: input.inReplyTo,
    references: input.references,
    sendAt: input.sendAt,
    status: input.status || existing?.status || 'draft',
    lastError: input.lastError,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  }
  const next = drafts.filter((item) => item.id !== draft.id)
  next.push(draft)
  await write(next)
  return draft
}

export async function deleteDraft(id: string) {
  const drafts = await read()
  await write(drafts.filter((draft) => draft.id !== id))
}
