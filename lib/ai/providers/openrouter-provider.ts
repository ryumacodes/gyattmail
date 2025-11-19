/**
 * OpenRouter AI provider implementation
 * OpenRouter is compatible with OpenAI API, providing access to multiple models
 */

import OpenAI from 'openai'
import { OpenAIProvider } from './openai-provider'
import type { AIConfig, CostEstimate } from '../types'

export class OpenRouterProvider extends OpenAIProvider {
  constructor(config: AIConfig) {
    super(config)

    // Override the client with OpenRouter base URL
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://gyattmail.com',
        'X-Title': 'gyattmail',
      },
    })
  }

  getProviderName(): string {
    return 'OpenRouter'
  }

  estimateCost(operation: string, inputLength: number): CostEstimate {
    const tokens = this.estimateTokens(operation + ' ' + inputLength.toString())

    // OpenRouter pricing varies by model
    // Using average cost for popular models
    let costPerMillionTokens = 0

    const model = this.config.model.toLowerCase()

    // Free models
    if (
      model.includes('llama-3.2') ||
      model.includes('gemma-2') ||
      model.includes('qwen')
    ) {
      costPerMillionTokens = 0
    }
    // Budget models ($0.1-0.5 per million)
    else if (
      model.includes('mistral') ||
      model.includes('mixtral') ||
      model.includes('llama-3.1-8b')
    ) {
      costPerMillionTokens = 0.2
    }
    // Mid-tier models ($0.5-2 per million)
    else if (
      model.includes('llama-3.1-70b') ||
      model.includes('gemini-pro')
    ) {
      costPerMillionTokens = 1.0
    }
    // Premium models ($2-10 per million)
    else if (
      model.includes('gpt-4') ||
      model.includes('claude-3')
    ) {
      costPerMillionTokens = 5.0
    }
    // Default estimate
    else {
      costPerMillionTokens = 1.0
    }

    const estimatedCost = (tokens / 1000000) * costPerMillionTokens

    return {
      provider: 'openrouter',
      model: this.config.model,
      estimatedTokens: tokens,
      estimatedCost,
      currency: 'USD',
    }
  }

  protected calculateCost(tokensUsed: number): number {
    const model = this.config.model.toLowerCase()

    // Free models
    if (
      model.includes('llama-3.2') ||
      model.includes('gemma-2') ||
      model.includes('qwen')
    ) {
      return 0
    }
    // Budget models
    if (
      model.includes('mistral') ||
      model.includes('mixtral') ||
      model.includes('llama-3.1-8b')
    ) {
      return (tokensUsed / 1000000) * 0.2
    }
    // Mid-tier models
    if (
      model.includes('llama-3.1-70b') ||
      model.includes('gemini-pro')
    ) {
      return (tokensUsed / 1000000) * 1.0
    }
    // Premium models
    if (
      model.includes('gpt-4') ||
      model.includes('claude-3')
    ) {
      return (tokensUsed / 1000000) * 5.0
    }

    // Default
    return (tokensUsed / 1000000) * 1.0
  }
}

/**
 * Popular OpenRouter models
 * Verify current models and pricing at openrouter.ai/models
 */
export const OPENROUTER_MODELS = {
  // Free models
  free: [
    'meta-llama/llama-3.2-3b-instruct:free',
    'google/gemma-2-9b-it:free',
    'qwen/qwen-2-7b-instruct:free',
  ],
  // Budget models
  budget: [
    'mistralai/mistral-7b-instruct',
    'mistralai/mixtral-8x7b-instruct',
    'meta-llama/llama-3.1-8b-instruct',
  ],
  // Mid-tier models
  midTier: [
    'meta-llama/llama-3.1-70b-instruct',
    'google/gemini-pro-1.5',
    'anthropic/claude-3-haiku',
  ],
  // Premium models
  premium: [
    'openai/gpt-4o',
    'anthropic/claude-3-5-sonnet',
    'google/gemini-pro',
  ],
}
