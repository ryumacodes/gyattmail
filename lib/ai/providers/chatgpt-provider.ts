import OpenAI from 'openai'
import { createOpenAIOptions } from '@openai-oauth/openai-client'
import { openaiCredentials } from '@openai-oauth/react/server'
import type { Response, ResponseInput } from 'openai/resources/responses/responses'
import type { AIConfig, CostEstimate } from '../types'
import { OpenAIProvider } from './openai-provider'

type ChatMessage = { role: string; content?: string | Array<{ text?: string }> }

function textContent(content: ChatMessage['content']): string {
  if (typeof content === 'string') return content
  return content?.map((part) => part.text ?? '').join('') ?? ''
}

function responseText(response: Response): string {
  return response.output_text
}

export class ChatGPTProvider extends OpenAIProvider {
  constructor(config: AIConfig, request: Request) {
    super({ ...config, apiKey: 'chatgpt-oauth' })
    const oauthClient = new OpenAI(createOpenAIOptions(openaiCredentials(request), {
      defaultHeaders: { originator: 'gyattmail' },
    }))

    this.client = new OpenAI({
      apiKey: 'chatgpt-oauth',
      fetch: async (_input, init) => {
        const request = JSON.parse(String(init?.body ?? '{}')) as {
          model: string
          messages?: ChatMessage[]
          response_format?: { type?: string }
        }
        const messages = request.messages ?? []
        const instructions = messages
          .filter((message) => message.role === 'system' || message.role === 'developer')
          .map((message) => textContent(message.content))
          .join('\n\n')
        const input: ResponseInput = messages
          .filter((message) => message.role !== 'system' && message.role !== 'developer')
          .map((message) => ({
            role: message.role === 'assistant' ? 'assistant' as const : 'user' as const,
            content: textContent(message.content),
          }))
        const result = await oauthClient.responses.create({
          model: request.model,
          input,
          instructions: instructions || 'You are a helpful email assistant.',
          store: false,
          ...(request.response_format?.type === 'json_object'
            ? { text: { format: { type: 'json_object' } } }
            : {}),
        })
        const usage = result.usage
        return Response.json({
          id: result.id ?? crypto.randomUUID(),
          object: 'chat.completion',
          created: result.created_at ?? Math.floor(Date.now() / 1000),
          model: result.model ?? request.model,
          choices: [{ index: 0, message: { role: 'assistant', content: responseText(result) }, finish_reason: 'stop' }],
          usage: {
            prompt_tokens: usage?.input_tokens ?? 0,
            completion_tokens: usage?.output_tokens ?? 0,
            total_tokens: usage?.total_tokens ?? 0,
          },
        })
      },
    })
  }

  getProviderName(): string {
    return 'ChatGPT'
  }

  estimateCost(operation: string, inputLength: number): CostEstimate {
    return {
      provider: 'chatgpt',
      model: this.config.model,
      estimatedTokens: this.estimateTokens(`${operation} ${inputLength}`),
      estimatedCost: 0,
      currency: 'USD',
    }
  }

  protected calculateCost(): number {
    return 0
  }
}
