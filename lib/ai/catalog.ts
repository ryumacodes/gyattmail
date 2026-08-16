import type { AIProvider } from './types'

const MODELS: Record<AIProvider, string[]> = {
  'opencode-zen': [
    'deepseek-v4-flash-free', 'mimo-v2.5-free', 'hy3-free', 'laguna-s-2.1-free',
    'nemotron-3-ultra-free', 'nemotron-3.5-lightning-free', 'big-pickle',
    'gpt-5.6-luna', 'gpt-5.6-terra', 'gpt-5.6-sol', 'gpt-5.5',
    'gpt-5.4-mini', 'gpt-5.4-nano', 'gpt-5.4', 'deepseek-v4-flash',
    'deepseek-v4-pro', 'minimax-m3', 'minimax-m2.7', 'glm-5.2', 'glm-5.1',
    'kimi-k2.7-code', 'kimi-k3',
  ],
  chatgpt: ['gpt-5.6-luna', 'gpt-5.6-terra', 'gpt-5.6-sol', 'gpt-5.5', 'gpt-5.4-mini', 'gpt-5.4'],
  gemini: ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-pro-preview', 'gemini-2.5-flash', 'gemini-2.5-pro'],
  openai: ['gpt-5-mini', 'gpt-4o', 'gpt-4o-mini'],
  openrouter: ['openrouter/free', 'openrouter/auto'],
  deepseek: ['deepseek-v4-flash', 'deepseek-v4-pro'],
  claude: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
}

const DEFAULT_MODELS: Record<AIProvider, string> = {
  'opencode-zen': 'deepseek-v4-flash-free',
  chatgpt: 'gpt-5.6-luna',
  gemini: 'gemini-3.6-flash',
  openai: 'gpt-5-mini',
  openrouter: 'openrouter/free',
  deepseek: 'deepseek-v4-flash',
  claude: 'claude-3-5-haiku-20241022',
}

const PROVIDER_NAMES: Record<AIProvider, string> = {
  'opencode-zen': 'OpenCode Zen',
  chatgpt: 'ChatGPT',
  gemini: 'Google Gemini',
  openai: 'OpenAI GPT',
  openrouter: 'OpenRouter',
  deepseek: 'DeepSeek',
  claude: 'Anthropic Claude',
}

const MODEL_NAMES: Record<string, string> = {
  'deepseek-v4-flash-free': 'DeepSeek V4 Flash (Free)',
  'mimo-v2.5-free': 'MiMo V2.5 (Free)',
  'hy3-free': 'Hy3 (Free)',
  'laguna-s-2.1-free': 'Laguna S 2.1 (Free)',
  'nemotron-3-ultra-free': 'Nemotron 3 Ultra (Free)',
  'nemotron-3.5-lightning-free': 'Nemotron 3.5 Lightning (Free)',
  'big-pickle': 'Big Pickle (Free)',
  'deepseek-v4-flash': 'DeepSeek V4 Flash',
  'deepseek-v4-pro': 'DeepSeek V4 Pro',
  'minimax-m3': 'MiniMax M3',
  'minimax-m2.7': 'MiniMax M2.7',
  'glm-5.2': 'GLM 5.2',
  'glm-5.1': 'GLM 5.1',
  'kimi-k2.7-code': 'Kimi K2.7 Code',
  'kimi-k3': 'Kimi K3',
  'gpt-5.6-luna': 'GPT-5.6 Luna',
  'gpt-5.6-terra': 'GPT-5.6 Terra',
  'gpt-5.6-sol': 'GPT-5.6 Sol',
  'gpt-5.5': 'GPT-5.5',
  'gpt-5.4-mini': 'GPT-5.4 Mini',
  'gpt-5.4-nano': 'GPT-5.4 Nano',
  'gpt-5.4': 'GPT-5.4',
  'gemini-3.6-flash': 'Gemini 3.6 Flash',
  'gemini-3.5-flash': 'Gemini 3.5 Flash',
  'gemini-3.5-flash-lite': 'Gemini 3.5 Flash-Lite',
  'gemini-3.1-pro-preview': 'Gemini 3.1 Pro (Preview)',
  'gemini-2.5-flash': 'Gemini 2.5 Flash',
  'gemini-2.5-pro': 'Gemini 2.5 Pro',
  'openrouter/free': 'OpenRouter Free Router',
  'openrouter/auto': 'OpenRouter Auto Router',
  'gpt-5-mini': 'GPT-5 Mini',
  'gpt-4o': 'GPT-4o',
  'gpt-4o-mini': 'GPT-4o Mini',
  'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
  'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku',
  'claude-3-opus-20240229': 'Claude 3 Opus',
}

export const getAvailableProviders = (): AIProvider[] => Object.keys(MODELS) as AIProvider[]
export const getAvailableModels = (provider: AIProvider): string[] => MODELS[provider] ?? []
export const getDefaultModel = (provider: AIProvider): string => DEFAULT_MODELS[provider] ?? ''
export const getProviderDisplayName = (provider: AIProvider): string => PROVIDER_NAMES[provider] ?? provider
export const getModelDisplayName = (model: string): string => MODEL_NAMES[model] ?? model
