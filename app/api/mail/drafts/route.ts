import { NextRequest, NextResponse } from 'next/server'
import { deleteDraft, listDrafts, saveDraft } from '@/lib/storage/draft-storage'
import type { MailDraft } from '@/lib/types/email'

export async function GET(request: NextRequest) {
  const accountId = request.nextUrl.searchParams.get('accountId') || undefined
  return NextResponse.json({ success: true, drafts: await listDrafts(accountId) })
}

export async function POST(request: NextRequest) {
  const input = await request.json() as Partial<MailDraft>
  if (!input.accountId) return NextResponse.json({ error: 'accountId is required' }, { status: 400 })
  if (input.status === 'scheduled' && (!input.sendAt || new Date(input.sendAt).getTime() <= Date.now())) {
    return NextResponse.json({ error: 'Choose a future send time' }, { status: 400 })
  }
  return NextResponse.json({
    success: true,
    draft: await saveDraft({ ...input, accountId: input.accountId }),
  })
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  await deleteDraft(id)
  return NextResponse.json({ success: true })
}
