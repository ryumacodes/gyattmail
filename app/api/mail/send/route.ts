/**
 * Send email API endpoint
 * Handles sending emails through authenticated accounts
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAccount } from '@/lib/storage/account-storage'
import { sendEmail, validateEmails } from '@/lib/email/smtp-client'
import type { SendEmailRequest, SendEmailResponse } from '@/lib/types/email'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: SendEmailRequest = await request.json()

    // Validate required fields
    if (!body.accountId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: accountId',
        } as SendEmailResponse,
        { status: 400 }
      )
    }

    if (!body.to || (Array.isArray(body.to) && body.to.length === 0)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: to (recipient)',
        } as SendEmailResponse,
        { status: 400 }
      )
    }

    if (!body.subject) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: subject',
        } as SendEmailResponse,
        { status: 400 }
      )
    }

    if (!body.text && !body.html) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: text or html (email body)',
        } as SendEmailResponse,
        { status: 400 }
      )
    }

    // Validate email addresses
    try {
      validateEmails(body.to)
      if (body.cc) validateEmails(body.cc)
      if (body.bcc) validateEmails(body.bcc)
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email address format',
          details: error instanceof Error ? error.message : 'Unknown error',
        } as SendEmailResponse,
        { status: 400 }
      )
    }

    // Get account
    const account = await getAccount(body.accountId)

    if (!account) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account not found',
        } as SendEmailResponse,
        { status: 404 }
      )
    }

    // Check account connection status
    if (account.connectionStatus === 'failed') {
      return NextResponse.json(
        {
          success: false,
          error: 'Account connection failed',
          details: account.lastError || 'Unknown connection error',
        } as SendEmailResponse,
        { status: 503 }
      )
    }

    // Send email
    const info = await sendEmail(account, body)

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    } as SendEmailResponse)
  } catch (error) {
    console.error('Send email error:', error)

    // Provide helpful error messages
    let errorMessage = 'Failed to send email'
    let details = error instanceof Error ? error.message : 'Unknown error'

    if (details.includes('Invalid login')) {
      errorMessage = 'Authentication failed'
      details = 'Please reconnect your account'
    } else if (details.includes('Recipient address rejected')) {
      errorMessage = 'Invalid recipient address'
    } else if (details.includes('Message size exceeds')) {
      errorMessage = 'Email too large'
      details = 'Try removing or compressing attachments'
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details,
      } as SendEmailResponse,
      { status: 500 }
    )
  }
}
