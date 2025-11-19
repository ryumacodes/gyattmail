/**
 * AI Manager - Factory for creating and managing AI providers
 */

import type { AIConfig, AIProvider } from './types'
import { BaseAIProvider } from './providers/base-provider'
import { GeminiProvider } from './providers/gemini-provider'
import { OpenAIProvider } from './providers/openai-provider'
import { OpenRouterProvider } from './providers/openrouter-provider'
import { ClaudeProvider } from './providers/claude-provider'

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

    // Try to get from environment variables (server-side)
    if (process.env.GEMINI_API_KEY) {
      return {
        provider: 'gemini',
        model: 'gemini-2.0-flash-exp',
        apiKey: process.env.GEMINI_API_KEY,
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
      localStorage.removeItem('gyattmail-ai-config')
    }
  } catch (error) {
    console.error('Failed to clear AI config:', error)
  }
}

/**
 * Create an AI provider instance
 */
export function createAIProvider(config: AIConfig): BaseAIProvider {
  switch (config.provider) {
    case 'gemini':
      return new GeminiProvider(config)

    case 'openai':
      return new OpenAIProvider(config)

    case 'openrouter':
      return new OpenRouterProvider(config)

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

export async function getAIProvider(): Promise<BaseAIProvider | null> {
  try {
    const config = await getAIConfig()

    if (!config) {
      return null
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
 * Get available AI providers
 */
export function getAvailableProviders(): AIProvider[] {
  return ['gemini', 'openai', 'openrouter', 'claude']
}

/**
 * Get available models for a provider
 */
export function getAvailableModels(provider: AIProvider): string[] {
  switch (provider) {
    case 'gemini':
      return ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash']
    case 'openai':
      return ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo']
    case 'openrouter':
      return [
        'meta-llama/llama-3.2-3b-instruct:free',
        'google/gemma-2-9b-it:free',
        'mistralai/mistral-7b-instruct',
        'meta-llama/llama-3.1-70b-instruct',
        'anthropic/claude-3-5-sonnet',
        'openai/gpt-4o',
      ]
    case 'claude':
      return [
        'claude-3-5-sonnet-20241022',
        'claude-3-5-haiku-20241022',
        'claude-3-opus-20240229',
      ]
    default:
      return []
  }
}

/**
 * Get default model for a provider
 */
export function getDefaultModel(provider: AIProvider): string {
  switch (provider) {
    case 'gemini':
      return 'gemini-2.0-flash-exp'
    case 'openai':
      return 'gpt-4o-mini'
    case 'openrouter':
      return 'meta-llama/llama-3.2-3b-instruct:free'
    case 'claude':
      return 'claude-3-5-haiku-20241022'
    default:
      return ''
  }
}

/**
 * Check if AI features are enabled
 */
export async function isAIEnabled(): Promise<boolean> {
  const config = await getAIConfig()
  return config !== null && config.apiKey.length > 0
}

/**
 * Get AI provider display name
 */
export function getProviderDisplayName(provider: AIProvider): string {
  switch (provider) {
    case 'gemini':
      return 'Google Gemini'
    case 'openai':
      return 'OpenAI GPT'
    case 'openrouter':
      return 'OpenRouter'
    case 'claude':
      return 'Anthropic Claude'
    default:
      return provider
  }
}

/**
 * Get model display name
 */
export function getModelDisplayName(model: string): string {
  // Gemini models
  if (model === 'gemini-2.0-flash-exp') return 'Gemini 2.0 Flash (Experimental)'
  if (model === 'gemini-1.5-pro') return 'Gemini 1.5 Pro'
  if (model === 'gemini-1.5-flash') return 'Gemini 1.5 Flash'

  // OpenAI models
  if (model === 'gpt-4o') return 'GPT-4o'
  if (model === 'gpt-4o-mini') return 'GPT-4o Mini'
  if (model === 'gpt-3.5-turbo') return 'GPT-3.5 Turbo'

  // Claude models
  if (model === 'claude-3-5-sonnet-20241022') return 'Claude 3.5 Sonnet'
  if (model === 'claude-3-5-haiku-20241022') return 'Claude 3.5 Haiku'
  if (model === 'claude-3-opus-20240229') return 'Claude 3 Opus'

  return model
}
