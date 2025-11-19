/**
 * Hook for managing AI configuration state
 */

'use client'

import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'
import type { AIConfig, AIProvider } from '@/lib/ai/types'
import {
  getAIConfig,
  saveAIConfig,
  clearAIConfig,
  getAvailableProviders,
  getAvailableModels,
  getDefaultModel,
} from '@/lib/ai/ai-manager'

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

  // Load config on mount
  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const loadedConfig = await getAIConfig()
      setConfig(loadedConfig)
    } catch (error) {
      console.error('Failed to load AI config:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = async (updates: Partial<AIConfig>) => {
    try {
      const newConfig: AIConfig = config
        ? { ...config, ...updates }
        : {
            provider: updates.provider || 'gemini',
            model: updates.model || 'gemini-2.0-flash-exp',
            apiKey: updates.apiKey || '',
            temperature: updates.temperature ?? 0.7,
            maxTokens: updates.maxTokens ?? 2048,
            enableCaching: updates.enableCaching ?? true,
          }

      await saveAIConfig(newConfig)
      setConfig(newConfig)
      return true
    } catch (error) {
      console.error('Failed to save AI config:', error)
      return false
    }
  }

  const clearConfig = async () => {
    try {
      await clearAIConfig()
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
