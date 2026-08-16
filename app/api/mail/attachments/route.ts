import { NextRequest, NextResponse } from 'next/server'
import { getEmail } from '@/lib/storage/email-storage'
import { getAccount } from '@/lib/storage/account-storage'
import { getAgentMailAttachment } from '@/lib/email/agentmail-client'

export async function GET(request: NextRequest) {
  const emailId = request.nextUrl.searchParams.get('emailId')
  const attachmentId = request.nextUrl.searchParams.get('attachmentId')
  if (!emailId || !attachmentId) return NextResponse.json({ error: 'emailId and attachmentId are required' }, { status: 400 })
  const email = await getEmail(emailId)
  if (!email) return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  const attachment = email.attachments.find((item) => item.id === attachmentId)
  if (!attachment) return NextResponse.json({ error: 'Attachment not found' }, { status: 404 })
  if (attachment.content) {
    return new NextResponse(Buffer.from(attachment.content, 'base64'), {
      headers: { 'Content-Type': attachment.contentType, 'Content-Disposition': `attachment; filename="${attachment.filename.replace(/"/g, '')}"` },
    })
  }
  const account = await getAccount(email.accountId)
  if (account?.provider === 'agentmail') {
    const remote = await getAgentMailAttachment(account, email.remoteMessageId || email.messageId, attachmentId)
    return NextResponse.redirect(remote.downloadUrl)
  }
  return NextResponse.json({ error: 'Attachment content is unavailable' }, { status: 404 })
}
