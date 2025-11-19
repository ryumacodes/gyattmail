/**
 * AI Settings Panel Component
 * Allows users to configure AI provider, model, and API key
 */

'use client'

import * as React from 'react'
import { Check, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useAIConfig } from '@/app/mail/use-ai-config'
import { getProviderDisplayName, getModelDisplayName } from '@/lib/ai/ai-manager'
import type { AIProvider } from '@/lib/ai/types'

export function AISettingsPanel() {
  const {
    config,
    loading,
    isConfigured,
    updateConfig,
    availableProviders,
    getModelsForProvider,
  } = useAIConfig()

  const [selectedProvider, setSelectedProvider] = React.useState<AIProvider>(
    config?.provider || 'gemini'
  )
  const [selectedModel, setSelectedModel] = React.useState(
    config?.model || 'gemini-2.5-flash-preview-05-20'
  )
  const [apiKey, setApiKeyState] = React.useState(config?.apiKey || '')
  const [showApiKey, setShowApiKey] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  // Update local state when config changes
  React.useEffect(() => {
    if (config) {
      setSelectedProvider(config.provider)
      setSelectedModel(config.model)
      setApiKeyState(config.apiKey)
    }
  }, [config])

  const availableModels = getModelsForProvider(selectedProvider)

  const handleProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider)
    // Auto-select first model for new provider
    const models = getModelsForProvider(provider)
    if (models.length > 0) {
      setSelectedModel(models[0])
    }
  }

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key')
      return
    }

    try {
      setSaving(true)

      // Save all settings atomically
      const success = await updateConfig({
        provider: selectedProvider,
        model: selectedModel,
        apiKey,
      })

      if (!success) {
        throw new Error('Failed to save AI settings')
      }

      toast.success('AI settings saved successfully!')
    } catch (error) {
      console.error('Failed to save AI settings:', error)
      toast.error('Failed to save AI settings')
    } finally {
      setSaving(false)
    }
  }

  const getProviderHelpText = (provider: AIProvider) => {
    switch (provider) {
      case 'gemini':
        return 'Get your free API key from Google AI Studio'
      case 'openai':
        return 'Get your API key from OpenAI Platform'
      case 'openrouter':
        return 'Get your API key from OpenRouter (access to 100+ models)'
      case 'claude':
        return 'Get your API key from Anthropic Console'
      default:
        return ''
    }
  }

  const getProviderLink = (provider: AIProvider) => {
    switch (provider) {
      case 'gemini':
        return 'https://aistudio.google.com/app/apikey'
      case 'openai':
        return 'https://platform.openai.com/api-keys'
      case 'openrouter':
        return 'https://openrouter.ai/keys'
      case 'claude':
        return 'https://console.anthropic.com/'
      default:
        return ''
    }
  }

  if (loading) {
    return <div className="text-sm text-ink-600">Loading AI settings...</div>
  }

  return (
    <div className="space-y-4">
      {/* Provider Selection */}
      <div>
        <Label htmlFor="ai-provider" className="text-ink-700">
          AI Provider
        </Label>
        <Select value={selectedProvider} onValueChange={handleProviderChange}>
          <SelectTrigger id="ai-provider" className="mt-2 border-hatch-400 bg-paper-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableProviders.map((provider) => (
              <SelectItem key={provider} value={provider}>
                {getProviderDisplayName(provider)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-1.5 text-xs text-ink-500">
          {getProviderHelpText(selectedProvider)}{' '}
          <a
            href={getProviderLink(selectedProvider)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            →
          </a>
        </p>
      </div>

      {/* Model Selection */}
      <div>
        <Label htmlFor="ai-model" className="text-ink-700">
          Model
        </Label>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger id="ai-model" className="mt-2 border-hatch-400 bg-paper-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableModels.map((model) => (
              <SelectItem key={model} value={model}>
                {getModelDisplayName(model)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* API Key */}
      <div>
        <Label htmlFor="ai-api-key" className="text-ink-700">
          API Key
        </Label>
        <div className="relative mt-2">
          <Input
            id="ai-api-key"
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKeyState(e.target.value)}
            placeholder={`Enter your ${getProviderDisplayName(selectedProvider)} API key`}
            className="pr-10 border-hatch-400 bg-paper-100"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setShowApiKey(!showApiKey)}
          >
            {showApiKey ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="mt-1.5 text-xs text-ink-500">
          Your API key is stored locally in this browser
        </p>
      </div>

      {/* Status */}
      {isConfigured && (
        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-300 rounded text-sm text-green-700">
          <Check className="h-4 w-4" />
          <span>AI features are configured and ready to use</span>
        </div>
      )}

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving || !apiKey.trim()}
        className="w-full bg-ink-700 hover:bg-ink-800 text-paper-100"
      >
        {saving ? 'Saving...' : 'Save AI Settings'}
      </Button>

      {/* Info */}
      <div className="p-3 bg-blue-50 border border-blue-300 rounded text-xs text-blue-700 space-y-1">
        <p className="font-semibold">Cost Estimates (Nov 2025):</p>
        <ul className="space-y-0.5 ml-4 list-disc">
          <li>Gemini 2.5 Flash: Free tier (15 RPM, 1M tokens/day) or ~$1.40 per million tokens</li>
          <li>GPT-5 Mini: ~$1.125 per million tokens</li>
          <li>Claude 3.5 Haiku: ~$2.40 per million tokens</li>
          <li>OpenRouter: Many free models available</li>
        </ul>
      </div>
    </div>
  )
}
