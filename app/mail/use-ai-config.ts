/**
 * Hook for managing AI configuration state
 */

'use client'

import { atom, useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import type { AIConfig, AIProvider } from '@/lib/ai/types'
import {
  getAvailableProviders,
  getAvailableModels,
  getDefaultModel,
} from '@/lib/ai/catalog'

// Atom for AI configuration
const aiConfigAtom = atom<AIConfig | null>(null)

// Atom for loading state
const aiConfigLoadingAtom = atom<boolean>(true)

/**
 * Hook to access and manage AI configuration
 */
export function useAIConfig() {
  const [config, setConfig] = useAtom(aiConfigAtom)
  const [loading, setLoading] = useAtom(aiConfigLoadingAtom)

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ai/config')
      if (!response.ok) throw new Error('Failed to load AI configuration')
      const data = await response.json()
      const loadedConfig = data.config as AIConfig | null
      setConfig(loadedConfig && data.configured
        ? { ...loadedConfig, apiKey: loadedConfig.apiKey || 'configured' }
        : null)
    } catch (error) {
      console.error('Failed to load AI config:', error)
    } finally {
      setLoading(false)
    }
  }, [setConfig, setLoading])

  useEffect(() => {
    void loadConfig()
  }, [loadConfig])

  const updateConfig = async (updates: Partial<AIConfig>) => {
    try {
      const newConfig: AIConfig = config
        ? { ...config, ...updates }
        : {
            provider: updates.provider || 'opencode-zen',
            model: updates.model || 'deepseek-v4-flash-free',
            apiKey: updates.apiKey || '',
            temperature: updates.temperature ?? 0.7,
            maxTokens: updates.maxTokens ?? 2048,
            enableCaching: updates.enableCaching ?? true,
          }

      const response = await fetch('/api/ai/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      })
      if (!response.ok) throw new Error('Failed to save AI configuration')
      setConfig(newConfig)
      return true
    } catch (error) {
      console.error('Failed to save AI config:', error)
      return false
    }
  }

  const clearConfig = async () => {
    try {
      const response = await fetch('/api/ai/config', { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to clear AI configuration')
      setConfig(null)
      return true
    } catch (error) {
      console.error('Failed to clear AI config:', error)
      return false
    }
  }

  const changeProvider = async (provider: AIProvider) => {
    const model = getDefaultModel(provider)
    return await updateConfig({ provider, model })
  }

  const changeModel = async (model: string) => {
    return await updateConfig({ model })
  }

  const setAPIKey = async (apiKey: string) => {
    return await updateConfig({ apiKey })
  }

  const isConfigured = (): boolean => {
    return config !== null && config.apiKey.length > 0
  }

  return {
    config,
    loading,
    isConfigured: isConfigured(),
    updateConfig,
    clearConfig,
    changeProvider,
    changeModel,
    setAPIKey,
    loadConfig,
    availableProviders: getAvailableProviders(),
    getModelsForProvider: getAvailableModels,
  }
}
