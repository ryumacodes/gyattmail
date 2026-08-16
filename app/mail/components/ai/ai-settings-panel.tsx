/**
 * AI Settings Panel Component
 * Allows users to configure AI provider, model, and API key
 */

'use client'

import * as React from 'react'
import { Check, ExternalLink, Eye, EyeOff, Loader2, LogOut } from 'lucide-react'
import { useSignInWithChatGPT } from '@openai-oauth/react'
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
import { getProviderDisplayName, getModelDisplayName } from '@/lib/ai/catalog'
import type { AIProvider } from '@/lib/ai/types'

export function AISettingsPanel() {
  const {
    config,
    loading,
    isConfigured,
    updateConfig,
    clearConfig,
    availableProviders,
    getModelsForProvider,
  } = useAIConfig()

  const [selectedProvider, setSelectedProvider] = React.useState<AIProvider>(
    config?.provider || 'opencode-zen'
  )
  const [selectedModel, setSelectedModel] = React.useState(
    config?.model || 'deepseek-v4-flash-free'
  )
  const [apiKey, setApiKeyState] = React.useState(config?.apiKey || '')
  const [showApiKey, setShowApiKey] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [openRouterModels, setOpenRouterModels] = React.useState<Array<{
    id: string
    name: string
    free: boolean
  }>>([])
  const loginRequestedRef = React.useRef(false)

  const chatGPTLogin = useSignInWithChatGPT({
    callbackPath: '/auth/chatgpt/callback',
    openMode: 'popup',
    onSuccess: () => {
      if (!loginRequestedRef.current) return
      loginRequestedRef.current = false
      void (async () => {
        const success = await updateConfig({
          provider: 'chatgpt',
          model: selectedModel,
          apiKey: 'chatgpt-oauth',
          authType: 'oauth',
        })
        if (success) {
          setApiKeyState('chatgpt-oauth')
          toast.success('ChatGPT connected successfully')
        } else {
          toast.error('ChatGPT connected, but GyattMail could not save the AI settings')
        }
      })()
    },
    onError: (error) => {
      loginRequestedRef.current = false
      toast.error(error.message)
    },
  })

  // Update local state when config changes
  React.useEffect(() => {
    if (config) {
      setSelectedProvider(config.provider)
      setSelectedModel(config.model)
      setApiKeyState(config.apiKey)
    }
  }, [config])

  React.useEffect(() => {
    if (selectedProvider !== 'openrouter' || openRouterModels.length > 0) return

    const controller = new AbortController()
    void fetch('/api/ai/models?provider=openrouter', { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Model catalog unavailable')))
      .then((data: { models?: Array<{ id: string; name: string; free: boolean }> }) => {
        setOpenRouterModels(data.models ?? [])
      })
      .catch((error) => {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Failed to load OpenRouter models:', error)
        }
      })

    return () => controller.abort()
  }, [openRouterModels.length, selectedProvider])

  const availableModels = selectedProvider === 'openrouter' && openRouterModels.length > 0
    ? openRouterModels.map((model) => model.id)
    : getModelsForProvider(selectedProvider)

  const modelDisplayName = (model: string) => {
    const openRouterModel = openRouterModels.find((candidate) => candidate.id === model)
    if (openRouterModel) return `${openRouterModel.name}${openRouterModel.free ? ' (Free)' : ''}`
    return getModelDisplayName(model)
  }

  const handleProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider)
    if (provider !== config?.provider) setApiKeyState('')
    // Auto-select first model for new provider
    const models = getModelsForProvider(provider)
    if (models.length > 0) {
      setSelectedModel(models[0])
    }
  }

  const handleSave = async () => {
    if (selectedProvider === 'chatgpt') {
      if (!chatGPTLogin.isSignedIn) {
        toast.error('Connect your ChatGPT account first')
        return
      }
    } else if (!apiKey.trim()) {
      toast.error('Please enter an API key')
      return
    }

    try {
      setSaving(true)

      // Save all settings atomically
      const success = await updateConfig({
        provider: selectedProvider,
        model: selectedModel,
        apiKey: selectedProvider === 'chatgpt' ? 'chatgpt-oauth' : apiKey,
        authType: selectedProvider === 'chatgpt' ? 'oauth' : 'api-key',
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

  const handleConnectChatGPT = async () => {
    if (chatGPTLogin.isSignedIn) {
      const success = await updateConfig({
        provider: 'chatgpt',
        model: selectedModel,
        apiKey: 'chatgpt-oauth',
        authType: 'oauth',
      })
      if (success) toast.success('GyattMail is now using your ChatGPT account')
      return
    }

    loginRequestedRef.current = true
    await chatGPTLogin.login()
  }

  const handleDisconnectChatGPT = async () => {
    await chatGPTLogin.logout()
    if (config?.provider === 'chatgpt') await clearConfig()
    setApiKeyState('')
    toast.success('ChatGPT disconnected')
  }

  const getProviderHelpText = (provider: AIProvider) => {
    switch (provider) {
      case 'opencode-zen':
        return 'Free and pay-as-you-go models; free models are listed first'
      case 'chatgpt':
        return 'Use your ChatGPT Plus or Pro subscription'
      case 'gemini':
        return 'Get your free API key from Google AI Studio'
      case 'openai':
        return 'Get your API key from OpenAI Platform'
      case 'openrouter':
        return 'Live free-first catalog with access to hundreds of models'
      case 'deepseek':
        return 'Use DeepSeek V4 directly with a DeepSeek API key'
      case 'claude':
        return 'Get your API key from Anthropic Console'
      default:
        return ''
    }
  }

  const getProviderLink = (provider: AIProvider) => {
    switch (provider) {
      case 'opencode-zen':
        return 'https://opencode.ai/auth'
      case 'chatgpt':
        return 'https://chatgpt.com/pricing'
      case 'gemini':
        return 'https://aistudio.google.com/app/apikey'
      case 'openai':
        return 'https://platform.openai.com/api-keys'
      case 'openrouter':
        return 'https://openrouter.ai/keys'
      case 'deepseek':
        return 'https://platform.deepseek.com/api_keys'
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
                {modelDisplayName(model)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProvider === 'chatgpt' ? (
        <div className="space-y-2">
          <Button
            type="button"
            onClick={handleConnectChatGPT}
            disabled={chatGPTLogin.status === 'checking' || chatGPTLogin.status === 'starting' || chatGPTLogin.status === 'redirecting'}
            className="w-full bg-ink-700 hover:bg-ink-800 text-paper-100"
          >
            {chatGPTLogin.status === 'checking' || chatGPTLogin.status === 'starting' || chatGPTLogin.status === 'redirecting' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="mr-2 h-4 w-4" />
            )}
            {chatGPTLogin.isSignedIn ? 'Use this ChatGPT account' : 'Sign in with ChatGPT'}
          </Button>
          {chatGPTLogin.isSignedIn && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDisconnectChatGPT}
              className="w-full border-hatch-400"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect ChatGPT
            </Button>
          )}
          {chatGPTLogin.status === 'needs-extension' && (
            <div className="rounded border border-hatch-400 bg-paper-100 p-3 text-sm text-ink-600">
              <p>The secure ChatGPT sign-in browser extension is required for hosted web apps.</p>
              <div className="mt-2 flex gap-2">
                <a
                  href={chatGPTLogin.installUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:underline"
                >
                  Install extension <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => void chatGPTLogin.reset()}
                  className="text-ink-500 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {chatGPTLogin.status === 'error' && (
            <p className="text-xs text-red-600">{chatGPTLogin.error.message}</p>
          )}
          <p className="text-xs text-ink-500">
            Your encrypted ChatGPT session stays in this browser and is only forwarded to GyattMail&apos;s AI routes.
          </p>
          <a
            href="https://github.com/EvanZhouDev/openai-oauth"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs text-blue-600 hover:underline"
          >
            Powered by OpenAI OAuth <ExternalLink className="ml-1 h-3.5 w-3.5" />
          </a>
        </div>
      ) : (
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
          Your API key is stored in this browser and encrypted on the self-hosted server
        </p>
      </div>
      )}

      {/* Status */}
      {isConfigured && selectedProvider === config?.provider && (
        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-300 rounded text-sm text-green-700">
          <Check className="h-4 w-4" />
          <span>AI features are configured and ready to use</span>
        </div>
      )}

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving || (selectedProvider === 'chatgpt' ? !chatGPTLogin.isSignedIn : !apiKey.trim())}
        className="w-full bg-ink-700 hover:bg-ink-800 text-paper-100"
      >
        {saving ? 'Saving...' : 'Save AI Settings'}
      </Button>

      {/* Info */}
      <div className="p-3 bg-blue-50 border border-blue-300 rounded text-xs text-blue-700 space-y-1">
        <p className="font-semibold">Provider notes:</p>
        <ul className="space-y-0.5 ml-4 list-disc">
          <li>Gemini: current stable and preview models through Google&apos;s supported SDK</li>
          <li>OpenRouter: live compatible-model catalog with free choices first</li>
          <li>DeepSeek: direct V4 Flash and V4 Pro access</li>
          <li>OpenCode Zen: free models first, then pay-as-you-go models</li>
          <li>ChatGPT: uses your Plus or Pro subscription limits</li>
        </ul>
      </div>
    </div>
  )
}
