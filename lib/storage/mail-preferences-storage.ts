import { promises as fs } from 'fs'
import path from 'path'
import { DEFAULT_MAIL_PREFERENCES, type MailPreferences } from '@/lib/types/mail-preferences'

const FILE = path.join(process.cwd(), '.data', 'mail-preferences.json')

export async function getMailPreferences(): Promise<MailPreferences> {
  try {
    return { ...DEFAULT_MAIL_PREFERENCES, ...JSON.parse(await fs.readFile(FILE, 'utf8')) }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return DEFAULT_MAIL_PREFERENCES
    throw error
  }
}

export async function saveMailPreferences(preferences: MailPreferences) {
  await fs.mkdir(path.dirname(FILE), { recursive: true, mode: 0o700 })
  await fs.writeFile(FILE, JSON.stringify(preferences, null, 2), { mode: 0o600 })
  await fs.chmod(FILE, 0o600)
  return preferences
}
