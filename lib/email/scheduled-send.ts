import { getAccount } from '@/lib/storage/account-storage'
import { deleteDraft, listDrafts, saveDraft } from '@/lib/storage/draft-storage'
import { sendEmail } from './smtp-client'
import { sendAgentMail } from './agentmail-client'

let running = false
export async function processDueDrafts() {
  if (running) return
  running = true
  try {
    const now = Date.now()
    const due = (await listDrafts()).filter((draft) => draft.status === 'scheduled' && draft.sendAt && new Date(draft.sendAt).getTime() <= now)
    for (const draft of due) {
      await saveDraft({ ...draft, status: 'sending' })
      try {
        const account = await getAccount(draft.accountId)
        if (!account) throw new Error('Sending account no longer exists')
        const request = { ...draft, to: draft.to }
        if (account.provider === 'agentmail') await sendAgentMail(account, request)
        else await sendEmail(account, request)
        await deleteDraft(draft.id)
      } catch (error) {
        await saveDraft({ ...draft, status: 'failed', lastError: error instanceof Error ? error.message : 'Send failed' })
      }
    }
  } finally {
    running = false
  }
}
