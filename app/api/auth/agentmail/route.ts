import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { AgentMailClient } from 'agentmail'
import { encrypt } from '@/lib/storage/encryption'
import { saveAccount } from '@/lib/storage/account-storage'
import type { EmailAccount } from '@/lib/types/email'

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json() as { apiKey?: string }
    if (!apiKey?.trim()) return NextResponse.json({ error: 'AgentMail API key is required' }, { status: 400 })
    const client = new AgentMailClient({ apiKey: apiKey.trim() })
    const response = await client.inboxes.list({ limit: 100 })
    if (!response.inboxes.length) return NextResponse.json({ error: 'No AgentMail inboxes were found' }, { status: 404 })

    const accounts: EmailAccount[] = []
    for (const inbox of response.inboxes) {
      const account: EmailAccount = {
        id: `agent-${crypto.createHash('sha256').update(inbox.inboxId).digest('hex').slice(0, 16)}`,
        email: inbox.email,
        label: inbox.displayName || inbox.email.split('@')[0],
        provider: 'agentmail',
        authType: 'api-key',
        agentMailApiKey: encrypt(apiKey.trim()),
        agentMailInboxId: inbox.inboxId,
        ownerKind: 'agent',
        connectionStatus: 'connected',
        createdAt: new Date().toISOString(),
      }
      await saveAccount(account)
      accounts.push(account)
    }
    return NextResponse.json({ success: true, accounts: accounts.map(({ agentMailApiKey: _secret, ...account }) => account) })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to connect AgentMail' }, { status: 400 })
  }
}
