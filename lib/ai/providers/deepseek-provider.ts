import OpenAI from 'openai'
import { OpenAIProvider } from './openai-provider'
import type { AIConfig, CostEstimate } from '../types'

const AVERAGE_COST_PER_MILLION: Record<string, number> = {
  'deepseek-v4-flash': 0.21,
  'deepseek-v4-pro': 0.6525,
}

export class DeepSeekProvider extends OpenAIProvider {
  constructor(config: AIConfig) {
    super(config)
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: 'https://api.deepseek.com',
      fetch: async (input, init) => {
        let body = init?.body
        if (typeof body === 'string') {
          const payload = JSON.parse(body) as Record<string, unknown>
          body = JSON.stringify({
            ...payload,
            thinking: { type: 'disabled' },
          })
        }
        return fetch(input, { ...init, body })
      },
    })
  }

  getProviderName(): string {
    return 'DeepSeek'
  }

  estimateCost(operation: string, inputLength: number): CostEstimate {
    const estimatedTokens = this.estimateTokens(`${operation} ${inputLength}`)
    const rate = AVERAGE_COST_PER_MILLION[this.config.model] ?? 0.21
    return {
      provider: 'deepseek',
      model: this.config.model,
      estimatedTokens,
      estimatedCost: (estimatedTokens / 1_000_000) * rate,
      currency: 'USD',
    }
  }

  protected calculateCost(tokensUsed: number): number {
    const rate = AVERAGE_COST_PER_MILLION[this.config.model] ?? 0.21
    return (tokensUsed / 1_000_000) * rate
  }
}
