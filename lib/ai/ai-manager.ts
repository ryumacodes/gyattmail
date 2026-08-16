/**
 * AI Manager - Factory for creating and managing AI providers
 */

import type { AIConfig } from './types'
import { BaseAIProvider } from './providers/base-provider'
import { GeminiProvider } from './providers/gemini-provider'
import { OpenAIProvider } from './providers/openai-provider'
import { OpenRouterProvider } from './providers/openrouter-provider'
import { ClaudeProvider } from './providers/claude-provider'
import { OpenCodeZenProvider } from './providers/opencode-zen-provider'
import { ChatGPTProvider } from './providers/chatgpt-provider'
import { DeepSeekProvider } from './providers/deepseek-provider'

/**
 * Get AI configuration from environment or storage
 */
export async function getAIConfig(): Promise<AIConfig | null> {
  try {
    // Try to get from localStorage (client-side)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gyattmail-ai-config')
      if (stored) {
        return JSON.parse(stored)
      }
    }

    const { getServerAIConfig } = await import('@/lib/storage/ai-config-storage')
    const serverConfig = await getServerAIConfig()
    if (serverConfig) return serverConfig

    if (process.env.OPENCODE_ZEN_API_KEY) {
      return {
        provider: 'opencode-zen',
        model: 'deepseek-v4-flash-free',
        apiKey: process.env.OPENCODE_ZEN_API_KEY,
        authType: 'api-key',
        temperature: 0.7,
        maxTokens: 2048,
        enableCaching: true,
      }
    }

    // Try to get from environment variables (server-side)
    if (process.env.GEMINI_API_KEY) {
      return {
        provider: 'gemini',
        model: 'gemini-3.6-flash',
        apiKey: process.env.GEMINI_API_KEY,
        temperature: 0.7,
        maxTokens: 2048,
        enableCaching: true,
      }
    }

    if (process.env.DEEPSEEK_API_KEY) {
      return {
        provider: 'deepseek',
        model: 'deepseek-v4-flash',
        apiKey: process.env.DEEPSEEK_API_KEY,
        authType: 'api-key',
        temperature: 0.7,
        maxTokens: 2048,
        enableCaching: true,
      }
    }

    if (process.env.OPENROUTER_API_KEY) {
      return {
        provider: 'openrouter',
        model: 'openrouter/free',
        apiKey: process.env.OPENROUTER_API_KEY,
        authType: 'api-key',
        temperature: 0.7,
        maxTokens: 2048,
        enableCaching: true,
      }
    }

    if (process.env.OPENAI_API_KEY) {
      return {
        provider: 'openai',
        model: 'gpt-4o-mini',
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.7,
        maxTokens: 2048,
        enableCaching: true,
      }
    }

    if (process.env.ANTHROPIC_API_KEY) {
      return {
        provider: 'claude',
        model: 'claude-3-5-haiku-20241022',
        apiKey: process.env.ANTHROPIC_API_KEY,
        temperature: 0.7,
        maxTokens: 2048,
        enableCaching: true,
      }
    }

    return null
  } catch (error) {
    console.error('Failed to get AI config:', error)
    return null
  }
}

/**
 * Save AI configuration to storage
 */
export async function saveAIConfig(config: AIConfig): Promise<void> {
  try {
    if (typeof window !== 'undefined') {
      const response = await fetch('/api/ai/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (!response.ok) throw new Error('Failed to save AI configuration on the server')
      localStorage.setItem('gyattmail-ai-config', JSON.stringify(config))
    }
  } catch (error) {
    console.error('Failed to save AI config:', error)
    throw error
  }
}

/**
 * Clear AI configuration from storage
 */
export async function clearAIConfig(): Promise<void> {
  try {
    if (typeof window !== 'undefined') {
      await fetch('/api/ai/config', { method: 'DELETE' })
      localStorage.removeItem('gyattmail-ai-config')
    }
  } catch (error) {
    console.error('Failed to clear AI config:', error)
  }
}

/**
 * Create an AI provider instance
 */
export function createAIProvider(config: AIConfig, request?: Request): BaseAIProvider {
  switch (config.provider) {
    case 'opencode-zen':
      return new OpenCodeZenProvider(config)

    case 'chatgpt':
      if (!request) throw new Error('ChatGPT requires request-bound OAuth credentials')
      return new ChatGPTProvider(config, request)

    case 'gemini':
      return new GeminiProvider(config)

    case 'openai':
      return new OpenAIProvider(config)

    case 'openrouter':
      return new OpenRouterProvider(config)

    case 'deepseek':
      return new DeepSeekProvider(config)

    case 'claude':
      return new ClaudeProvider(config)

    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`)
  }
}

/**
 * Get or create AI provider with current configuration
 */
let cachedProvider: BaseAIProvider | null = null
let cachedConfig: AIConfig | null = null

export async function getAIProvider(request?: Request): Promise<BaseAIProvider | null> {
  try {
    const config = await getAIConfig()

    if (!config) {
      return null
    }

    if (config.provider === 'chatgpt') {
      return createAIProvider(config, request)
    }

    // Return cached provider if config hasn't changed
    if (
      cachedProvider &&
      cachedConfig &&
      cachedConfig.provider === config.provider &&
      cachedConfig.model === config.model &&
      cachedConfig.apiKey === config.apiKey
    ) {
      return cachedProvider
    }

    // Create new provider
    cachedProvider = createAIProvider(config)
    cachedConfig = config

    return cachedProvider
  } catch (error) {
    console.error('Failed to get AI provider:', error)
    return null
  }
}

/**
 * Clear cached provider (call when config changes)
 */
export function clearProviderCache(): void {
  cachedProvider = null
  cachedConfig = null
}

/**
 * Validate AI configuration
 */
export async function validateAIConfig(config: AIConfig): Promise<boolean> {
  try {
    const provider = createAIProvider(config)
    return await provider.validateConfig()
  } catch (error) {
    console.error('Failed to validate AI config:', error)
    return false
  }
}

/**
 * Check if AI features are enabled
 */
export async function isAIEnabled(): Promise<boolean> {
  const config = await getAIConfig()
  return config !== null && config.apiKey.length > 0
}
