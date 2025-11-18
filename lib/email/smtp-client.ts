/**
 * SMTP client for sending emails through various providers
 * Supports Gmail OAuth2, Outlook OAuth2, and custom SMTP servers
 */

import nodemailer, { type Transporter } from 'nodemailer'
import type { EmailAccount, SendEmailRequest } from '@/lib/types/email'
import { decrypt, encrypt } from '@/lib/storage/encryption'
import {
  refreshGmailAccessToken,
  refreshOutlookAccessToken,
  isTokenExpired,
} from '@/lib/email/oauth-manager'
import { updateAccountTokens } from '@/lib/storage/account-storage'

/**
 * Create a Nodemailer transporter for Gmail with OAuth2
 *
 * @param account - Email account with Gmail OAuth2 credentials
 * @returns Configured Nodemailer transporter
 */
export async function createGmailTransporter(account: EmailAccount): Promise<Transporter> {
  if (!account.refreshToken) {
    throw new Error('Gmail account missing refresh token')
  }

  let accessToken: string

  // Check if we have a valid access token
  const now = Date.now()
  const tokenExpiry = account.tokenExpiry || 0
  const isExpired = tokenExpiry - (5 * 60 * 1000) <= now // 5 minute buffer

  if (account.accessToken && !isExpired) {
    // Use existing access token if it's still valid
    accessToken = decrypt(account.accessToken)
  } else {
    // Refresh access token if expired
    const refreshToken = decrypt(account.refreshToken)

    // Decrypt OAuth credentials if they exist (for user-provided credentials)
    const clientId = account.oauthClientId ? decrypt(account.oauthClientId) : undefined
    const clientSecret = account.oauthClientSecret ? decrypt(account.oauthClientSecret) : undefined

    accessToken = await refreshGmailAccessToken(refreshToken, clientId, clientSecret)

    // Save refreshed token to account storage (expires in 1 hour)
    const tokenExpiry = Date.now() + (3600 * 1000) // 1 hour from now
    await updateAccountTokens(account.id, encrypt(accessToken), undefined, tokenExpiry)
  }

  // Get refresh token for nodemailer config
  const refreshTokenValue = decrypt(account.refreshToken)

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: account.email,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: refreshTokenValue,
      accessToken,
    },
  })
}

/**
 * Create a Nodemailer transporter for Outlook with OAuth2
 *
 * @param account - Email account with Outlook OAuth2 credentials
 * @returns Configured Nodemailer transporter
 */
export async function createOutlookTransporter(account: EmailAccount): Promise<Transporter> {
  if (!account.refreshToken) {
    throw new Error('Outlook account missing refresh token')
  }

  let accessToken: string

  // Check if we have a valid access token
  const now = Date.now()
  const tokenExpiry = account.tokenExpiry || 0
  const isExpired = tokenExpiry - (5 * 60 * 1000) <= now // 5 minute buffer

  if (account.accessToken && !isExpired) {
    // Use existing access token if it's still valid
    accessToken = decrypt(account.accessToken)
  } else {
    // Refresh access token if expired
    const refreshToken = decrypt(account.refreshToken)

    // Decrypt OAuth credentials if they exist (for user-provided credentials)
    const clientId = account.oauthClientId ? decrypt(account.oauthClientId) : undefined
    const clientSecret = account.oauthClientSecret ? decrypt(account.oauthClientSecret) : undefined

    accessToken = await refreshOutlookAccessToken(refreshToken, clientId, clientSecret)

    // Save refreshed token to account storage (expires in 1 hour)
    const tokenExpiry = Date.now() + (3600 * 1000) // 1 hour from now
    await updateAccountTokens(account.id, encrypt(accessToken), undefined, tokenExpiry)
  }

  // Outlook/Office365 SMTP settings
  return nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
      type: 'OAuth2',
      user: account.email,
      accessToken,
    },
  })
}

/**
 * Create a Nodemailer transporter for custom SMTP server
 *
 * @param account - Email account with custom SMTP credentials
 * @returns Configured Nodemailer transporter
 */
export async function createCustomTransporter(account: EmailAccount): Promise<Transporter> {
  if (!account.smtpHost || !account.smtpPort || !account.smtpUser || !account.smtpPassword) {
    throw new Error('Custom SMTP account missing required credentials')
  }

  // Decrypt credentials
  const user = decrypt(account.smtpUser)
  const pass = decrypt(account.smtpPassword)

  return nodemailer.createTransport({
    host: account.smtpHost,
    port: account.smtpPort,
    secure: account.smtpSecure ?? account.smtpPort === 465, // true for 465, false for others
    auth: {
      user,
      pass,
    },
  })
}

/**
 * Create appropriate transporter based on account provider
 *
 * @param account - Email account
 * @returns Configured Nodemailer transporter
 */
export async function createTransporter(account: EmailAccount): Promise<Transporter> {
  switch (account.provider) {
    case 'gmail':
      return createGmailTransporter(account)
    case 'outlook':
      return createOutlookTransporter(account)
    case 'custom':
      return createCustomTransporter(account)
    default:
      throw new Error(`Unsupported email provider: ${account.provider}`)
  }
}

/**
 * Send an email using the appropriate transporter
 *
 * @param account - Email account to send from
 * @param request - Email send request
 * @returns Message info including messageId
 */
export async function sendEmail(account: EmailAccount, request: SendEmailRequest) {
  const transporter = await createTransporter(account)

  try {
    const mailOptions = {
      from: {
        name: account.label,
        address: account.email,
      },
      to: Array.isArray(request.to) ? request.to.join(', ') : request.to,
      cc: request.cc?.join(', '),
      bcc: request.bcc?.join(', '),
      subject: request.subject,
      text: request.text,
      html: request.html,
      replyTo: request.replyTo,
      inReplyTo: request.inReplyTo,
      references: request.references,
      attachments: request.attachments?.map((att) => ({
        filename: att.filename,
        content: Buffer.from(att.content, 'base64'),
        contentType: att.contentType,
      })),
    }

    const info = await transporter.sendMail(mailOptions)

    return info
  } finally {
    // Close the transporter to release the SMTP connection
    transporter.close()
  }
}

/**
 * Test SMTP connection for an account
 *
 * @param account - Email account to test
 * @returns true if connection successful
 */
export async function testSmtpConnection(account: EmailAccount): Promise<boolean> {
  let transporter: Transporter | null = null
  try {
    transporter = await createTransporter(account)
    await transporter.verify()
    return true
  } catch (error) {
    console.error('SMTP connection test failed:', error)
    return false
  } finally {
    // Close the transporter to release the SMTP connection
    if (transporter) {
      transporter.close()
    }
  }
}

/**
 * Validate email address format
 *
 * @param email - Email address to validate
 * @returns true if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate and sanitize email addresses
 *
 * @param emails - Single email or array of emails
 * @returns Array of valid emails
 */
export function validateEmails(emails: string | string[]): string[] {
  const emailArray = Array.isArray(emails) ? emails : [emails]

  const validEmails = emailArray
    .map((email) => email.trim())
    .filter((email) => email.length > 0 && isValidEmail(email))

  if (validEmails.length === 0) {
    throw new Error('No valid email addresses provided')
  }

  return validEmails
}
