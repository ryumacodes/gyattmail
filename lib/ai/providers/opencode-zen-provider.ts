import OpenAI from 'openai'
import type { AIConfig, CostEstimate } from '../types'
import { OpenAIProvider } from './openai-provider'

const FREE_MODELS = new Set([
  'deepseek-v4-flash-free',
  'mimo-v2.5-free',
  'hy3-free',
  'laguna-s-2.1-free',
  'nemotron-3-ultra-free',
  'nemotron-3.5-lightning-free',
  'big-pickle',
])

const AVERAGE_COST_PER_MILLION: Record<string, number> = {
  'gpt-5.6-luna': 0.7,
  'gpt-5.6-terra': 7,
  'gpt-5.6-sol': 17.5,
  'gpt-5.5': 17.5,
  'gpt-5.4-mini': 2.625,
  'gpt-5.4-nano': 0.725,
  'gpt-5.4': 8.75,
  'deepseek-v4-flash': 0.77,
  'deepseek-v4-pro': 2.31,
  'minimax-m3': 0.75,
  'minimax-m2.7': 0.75,
  'glm-5.2': 2.9,
  'glm-5.1': 2.9,
  'kimi-k2.7-code': 2.475,
  'kimi-k3': 9,
}

const RESPONSES_MODELS = new Set([
  'gpt-5.6-luna',
  'gpt-5.6-terra',
  'gpt-5.6-sol',
  'gpt-5.5',
  'gpt-5.4-mini',
  'gpt-5.4-nano',
  'gpt-5.4',
])

type ChatMessage = { role: string; content?: string | Array<{ text?: string }> }

interface ZenResponse {
  id?: string
  output_text?: string
  created_at?: number
  model?: string
  output?: Array<{
    type?: string
    content?: Array<{ type?: string; text?: string }>
  }>
  usage?: {
    input_tokens?: number
    output_tokens?: number
    total_tokens?: number
  }
}

function messageText(content: ChatMessage['content']): string {
  if (typeof content === 'string') return content
  return content?.map((part) => part.text ?? '').join('') ?? ''
}

function outputText(response: ZenResponse): string {
  if (typeof response.output_text === 'string') return response.output_text
  return (response.output ?? [])
    .flatMap((item) => item.type === 'message' ? item.content ?? [] : [])
    .filter((part) => part.type === 'output_text')
    .map((part) => part.text ?? '')
    .join('')
}

export class OpenCodeZenProvider extends OpenAIProvider {
  constructor(config: AIConfig) {
    super(config)
    this.client = new OpenAI({
      apiKey: config.apiKey,
      fetch: async (_input, init) => {
        const request = JSON.parse(String(init?.body ?? '{}')) as {
          model: string
          messages?: ChatMessage[]
          response_format?: { type?: string }
        }
        const headers = new Headers({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        })

        if (!RESPONSES_MODELS.has(request.model)) {
          return fetch('https://opencode.ai/zen/v1/chat/completions', {
            method: 'POST',
            headers,
            body: String(init?.body ?? '{}'),
          })
        }

        const messages = request.messages ?? []
        const instructions = messages
          .filter((message) => message.role === 'system' || message.role === 'developer')
          .map((message) => messageText(message.content))
          .join('\n\n')
        const input = messages
          .filter((message) => message.role !== 'system' && message.role !== 'developer')
          .map((message) => ({
            role: message.role === 'assistant' ? 'assistant' : 'user',
            content: [{
              type: message.role === 'assistant' ? 'output_text' : 'input_text',
              text: messageText(message.content),
            }],
          }))
        const upstream = await fetch('https://opencode.ai/zen/v1/responses', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: request.model,
            input,
            instructions: instructions || 'You are a helpful email assistant.',
            store: false,
            stream: false,
            ...(request.response_format?.type === 'json_object'
              ? { text: { format: { type: 'json_object' } } }
              : {}),
          }),
        })
        if (!upstream.ok) return upstream
        const result = await upstream.json() as ZenResponse
        const usage = result.usage ?? {}
        return Response.json({
          id: result.id ?? crypto.randomUUID(),
          object: 'chat.completion',
          created: result.created_at ?? Math.floor(Date.now() / 1000),
          model: result.model ?? request.model,
          choices: [{ index: 0, message: { role: 'assistant', content: outputText(result) }, finish_reason: 'stop' }],
          usage: {
            prompt_tokens: usage.input_tokens ?? 0,
            completion_tokens: usage.output_tokens ?? 0,
            total_tokens: usage.total_tokens ?? 0,
          },
        })
      },
    })
  }

  getProviderName(): string {
    return 'OpenCode Zen'
  }

  estimateCost(operation: string, inputLength: number): CostEstimate {
    const estimatedTokens = this.estimateTokens(`${operation} ${inputLength}`)
    const rate = FREE_MODELS.has(this.config.model)
      ? 0
      : AVERAGE_COST_PER_MILLION[this.config.model] ?? 1
    return {
      provider: 'opencode-zen',
      model: this.config.model,
      estimatedTokens,
      estimatedCost: (estimatedTokens / 1_000_000) * rate,
      currency: 'USD',
    }
  }

  protected calculateCost(tokensUsed: number): number {
    if (FREE_MODELS.has(this.config.model)) return 0
    return (tokensUsed / 1_000_000) * (AVERAGE_COST_PER_MILLION[this.config.model] ?? 1)
  }
}
