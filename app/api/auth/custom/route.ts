/**
 * Custom IMAP/SMTP account setup endpoint
 * Handles iCloud, Yahoo, and other email providers
 */

import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { saveAccount } from '@/lib/storage/account-storage'
import { encrypt } from '@/lib/storage/encryption'
import type { EmailAccount } from '@/lib/types/email'
import { connectCustomIMAP } from '@/lib/email/imap-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, imapHost, smtpHost, password } = body

    // Parse ports to integers (they may come as strings from JSON)
    const imapPort = typeof body.imapPort === 'string' ? parseInt(body.imapPort, 10) : body.imapPort
    const smtpPort = typeof body.smtpPort === 'string' ? parseInt(body.smtpPort, 10) : body.smtpPort

    // Validate required fields
    if (!email || !imapHost || !imapPort || !smtpHost || !smtpPort || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    // Validate ports are valid numbers
    if (isNaN(imapPort) || isNaN(smtpPort)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid port numbers',
        },
        { status: 400 }
      )
    }

    // Encrypt credentials
    const encryptedPassword = encrypt(password)
    const encryptedSmtpUser = encrypt(email) // Usually same as email
    const encryptedSmtpPassword = encrypt(password)

    // Create account object
    const account: EmailAccount = {
      id: randomUUID(),
      email,
      provider: 'custom',
      authType: 'password',
      label: email.split('@')[0], // Use email username as label

      // IMAP settings
      imapHost,
      imapPort,
      imapUser: email,
      imapPassword: encryptedPassword,
      imapSecure: imapPort === 993, // SSL/TLS for 993, STARTTLS for 143

      // SMTP settings
      smtpHost,
      smtpPort,
      smtpUser: encryptedSmtpUser,
      smtpPassword: encryptedSmtpPassword,
      smtpSecure: smtpPort === 465, // SSL/TLS for 465, STARTTLS for 587

      connectionStatus: 'reconnecting',
      createdAt: new Date().toISOString(),
    }

    // Test IMAP connection before saving
    try {
      const imapClient = await connectCustomIMAP(account)
      await imapClient.logout()
      account.connectionStatus = 'connected'
    } catch (error) {
      console.error('IMAP connection test failed:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to connect to email server',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 401 }
      )
    }

    // Save account to storage
    await saveAccount(account)

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        email: account.email,
        provider: account.provider,
        connectionStatus: account.connectionStatus,
      },
    })
  } catch (error) {
    console.error('Failed to setup custom email account:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to setup email account',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
