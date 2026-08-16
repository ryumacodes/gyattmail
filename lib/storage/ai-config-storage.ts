import { promises as fs } from 'fs'
import path from 'path'
import type { AIConfig } from '@/lib/ai/types'
import { decrypt, encrypt } from './encryption'

interface StoredAIConfig extends Omit<AIConfig, 'apiKey'> {
  encryptedApiKey: string
}

const CONFIG_PATH = path.join(process.cwd(), '.data', 'ai-config.json')

export async function saveServerAIConfig(config: AIConfig): Promise<void> {
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true, mode: 0o700 })
  const { apiKey, ...publicConfig } = config
  const stored: StoredAIConfig = {
    ...publicConfig,
    encryptedApiKey: encrypt(apiKey),
  }
  await fs.writeFile(CONFIG_PATH, JSON.stringify(stored, null, 2), { mode: 0o600 })
}

export async function getServerAIConfig(): Promise<AIConfig | null> {
  try {
    const stored = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf8')) as StoredAIConfig
    const { encryptedApiKey, ...config } = stored
    return { ...config, apiKey: decrypt(encryptedApiKey) }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}

export async function clearServerAIConfig(): Promise<void> {
  await fs.unlink(CONFIG_PATH).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== 'ENOENT') throw error
  })
}
