/**
 * AES-256-GCM encryption utilities for securing sensitive data
 * Uses crypto module built into Node.js
 */

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // 96 bits - NIST recommendation for GCM
const AUTH_TAG_LENGTH = 16
const KEY_LENGTH = 32

/**
 * Get the encryption key from environment variable
 * In production, this should be stored in a secure secrets manager
 */
function getEncryptionKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY

  if (!keyHex) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is not set. ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    )
  }

  const key = Buffer.from(keyHex, 'hex')

  if (key.length !== KEY_LENGTH) {
    throw new Error(`ENCRYPTION_KEY must be ${KEY_LENGTH} bytes (64 hex characters)`)
  }

  // Warn if using a weak or example key
  const weakKeys = [
    '00000000000000000000000000000000',
    '11111111111111111111111111111111',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'your_32_byte_hex_key_here',
  ]

  const keyLower = keyHex.toLowerCase()
  if (weakKeys.some(weak => keyLower.includes(weak))) {
    console.warn(
      '⚠️  WARNING: Using a weak or example ENCRYPTION_KEY. ' +
      'Generate a secure key with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    )
  }

  return key
}

/**
 * Encrypt a string using AES-256-GCM
 * Returns format: iv:authTag:encryptedData (all in hex)
 *
 * @param text - Plain text to encrypt
 * @returns Encrypted string in format "iv:authTag:encrypted"
 */
export function encrypt(text: string): string {
  if (!text) {
    throw new Error('Cannot encrypt empty string')
  }

  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  // Return in format: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

/**
 * Decrypt a string encrypted with AES-256-GCM
 * Expects format: iv:authTag:encryptedData (all in hex)
 *
 * @param encrypted - Encrypted string in format "iv:authTag:encrypted"
 * @returns Decrypted plain text
 */
export function decrypt(encrypted: string): string {
  if (!encrypted) {
    throw new Error('Cannot decrypt empty string')
  }

  const parts = encrypted.split(':')

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format. Expected "iv:authTag:encrypted"')
  }

  const [ivHex, authTagHex, encryptedText] = parts

  const key = getEncryptionKey()
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Generate a random encryption key
 * Use this to generate the ENCRYPTION_KEY environment variable
 *
 * @returns A random 32-byte key in hex format
 */
export function generateKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex')
}

/**
 * Securely compare two strings in constant time
 * Prevents timing attacks
 *
 * @param a - First string
 * @param b - Second string
 * @returns true if strings are equal
 */
export function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')

  if (bufA.length !== bufB.length) {
    return false
  }

  return crypto.timingSafeEqual(bufA, bufB)
}
