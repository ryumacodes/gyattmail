/**
 * OpenAI AI provider implementation
 */

import OpenAI from 'openai'
import { BaseAIProvider } from './base-provider'
import type {
  AIConfig,
  AIResponse,
  DraftEmailRequest,
  DraftEmailResponse,
  ImproveTextRequest,
  ImproveTextResponse,
  AdjustToneRequest,
  AdjustToneResponse,
  SummarizeEmailRequest,
  SummarizeEmailResponse,
  AnalyzeEmailRequest,
  AnalyzeEmailResponse,
  SmartRepliesRequest,
  SmartRepliesResponse,
  SuggestLabelsRequest,
  SuggestLabelsResponse,
  SummarizeThreadRequest,
  SummarizeThreadResponse,
  CostEstimate,
} from '../types'

export class OpenAIProvider extends BaseAIProvider {
  protected client: OpenAI

  constructor(config: AIConfig) {
    super(config)
    this.client = new OpenAI({
      apiKey: config.apiKey,
    })
  }

  getProviderName(): string {
    return 'OpenAI'
  }

  async validateConfig(): Promise<boolean> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5,
      })
      return !!response.choices[0]?.message?.content
    } catch (error) {
      return false
    }
  }

  async draftEmail(
    request: DraftEmailRequest
  ): Promise<AIResponse<DraftEmailResponse>> {
    const prompt = this.buildDraftEmailPrompt(request)

    try {
      const response = await this.retry(async () => {
        return await this.client.chat.completions.create({
          model: request.model || this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert email writing assistant. Generate professional, contextually appropriate emails in JSON format.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: this.config.temperature ?? 0.7,
          max_tokens: this.config.maxTokens ?? 2048,
          response_format: { type: 'json_object' },
        })
      })

      const content = response.choices[0]?.message?.content || '{}'
      const parsed = JSON.parse(content) as DraftEmailResponse

      const tokensUsed = response.usage?.total_tokens

      return this.wrapResponse(
        {
          subject: parsed.subject,
          body: parsed.body,
          confidence: parsed.confidence || 0.9,
        },
        tokensUsed
      )
    } catch (error) {
      throw this.formatError(error, 'draftEmail')
    }
  }

  async improveText(
    request: ImproveTextRequest
  ): Promise<AIResponse<ImproveTextResponse>> {
    const improvements = request.improvements.join(', ')
    const prompt = `Improve the following email text for ${improvements}:

Original text:
${request.text}

Return a JSON object with:
{
  "improvedText": "the improved version",
  "changes": [
    {"original": "original phrase", "improved": "improved phrase", "reason": "why it was changed"}
  ]
}`

    try {
      const response = await this.retry(async () => {
        return await this.client.chat.completions.create({
          model: request.model || this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert writing editor. Improve email text and explain your changes.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          max_tokens: this.config.maxTokens ?? 2048,
          response_format: { type: 'json_object' },
        })
      })

      const content = response.choices[0]?.message?.content || '{}'
      const parsed = JSON.parse(content) as ImproveTextResponse

      const tokensUsed = response.usage?.total_tokens

      return this.wrapResponse(parsed, tokensUsed)
    } catch (error) {
      throw this.formatError(error, 'improveText')
    }
  }

  async adjustTone(
    request: AdjustToneRequest
  ): Promise<AIResponse<AdjustToneResponse>> {
    const prompt = `Adjust the tone of the following email text to be ${request.targetTone}:

Original text:
${request.text}

Return a JSON object with:
{
  "adjustedText": "the text with adjusted tone",
  "originalTone": "detected original tone",
  "targetTone": "${request.targetTone}"
}`

    try {
      const response = await this.retry(async () => {
        return await this.client.chat.completions.create({
          model: request.model || this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert communication specialist. Adjust email tone while preserving meaning.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.5,
          max_tokens: this.config.maxTokens ?? 2048,
          response_format: { type: 'json_object' },
        })
      })

      const content = response.choices[0]?.message?.content || '{}'
      const parsed = JSON.parse(content) as AdjustToneResponse

      const tokensUsed = response.usage?.total_tokens

      return this.wrapResponse(parsed, tokensUsed)
    } catch (error) {
      throw this.formatError(error, 'adjustTone')
    }
  }

  async completeText(
    text: string,
    context?: string
  ): Promise<AIResponse<string>> {
    const prompt = context
      ? `Context: ${context}\n\nComplete this email text naturally:\n${text}`
      : `Complete this email text naturally:\n${text}`

    try {
      const response = await this.retry(async () => {
        return await this.client.chat.completions.create({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'Complete the email text naturally, continuing from where the user left off. Only provide the completion, not the entire email.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 256,
        })
      })

      const completion = response.choices[0]?.message?.content?.trim() || ''
      const tokensUsed = response.usage?.total_tokens

      return this.wrapResponse(completion, tokensUsed)
    } catch (error) {
      throw this.formatError(error, 'completeText')
    }
  }

  async summarizeEmail(
    request: SummarizeEmailRequest
  ): Promise<AIResponse<SummarizeEmailResponse>> {
    const prompt = this.buildSummarizeEmailPrompt(request)

    try {
      const response = await this.retry(async () => {
        return await this.client.chat.completions.create({
          model: request.model || this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert at summarizing emails. Provide concise, accurate summaries that capture the key information.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 512,
          response_format: { type: 'json_object' },
        })
      })

      const content = response.choices[0]?.message?.content || '{}'
      const parsed = JSON.parse(content) as SummarizeEmailResponse

      const tokensUsed = response.usage?.total_tokens

      return this.wrapResponse(parsed, tokensUsed)
    } catch (error) {
      throw this.formatError(error, 'summarizeEmail')
    }
  }

  async analyzeEmail(
    request: AnalyzeEmailRequest
  ): Promise<AIResponse<AnalyzeEmailResponse>> {
    const prompt = this.buildAnalyzeEmailPrompt(request)

    try {
      const response = await this.retry(async () => {
        return await this.client.chat.completions.create({
          model: request.model || this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert email analyst. Accurately assess priority, sentiment, and extract action items from emails.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.1,
          max_tokens: 1024,
          response_format: { type: 'json_object' },
        })
      })

      const content = response.choices[0]?.message?.content || '{}'
      const parsed = JSON.parse(content) as AnalyzeEmailResponse

      const tokensUsed = response.usage?.total_tokens

      return this.wrapResponse(parsed, tokensUsed)
    } catch (error) {
      throw this.formatError(error, 'analyzeEmail')
    }
  }

  async summarizeThread(
    request: SummarizeThreadRequest
  ): Promise<AIResponse<SummarizeThreadResponse>> {
    const threadText = request.emails
      .map((email, i) => {
        return `[Email ${i + 1}]
From: ${email.from}
To: ${email.to.join(', ')}
Date: ${email.date}
Subject: ${email.subject}

${email.body}
---`
      })
      .join('\n\n')

    const prompt = `Analyze this email thread and provide a comprehensive summary:

${threadText}

Return a JSON object with:
{
  "threadSummary": "2-3 sentence summary of the entire conversation",
  "participants": ["email1@example.com", ...],
  "keyTopics": ["topic1", "topic2", ...],
  "actionItems": [
    {"task": "description", "assignedTo": "email or null", "deadline": "date or null"}
  ],
  "sentiment": "positive|neutral|negative|mixed"
}`

    try {
      const response = await this.retry(async () => {
        return await this.client.chat.completions.create({
          model: request.model || this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert at analyzing email threads and extracting key information.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 1024,
          response_format: { type: 'json_object' },
        })
      })

      const content = response.choices[0]?.message?.content || '{}'
      const parsed = JSON.parse(content) as SummarizeThreadResponse

      const tokensUsed = response.usage?.total_tokens

      return this.wrapResponse(parsed, tokensUsed)
    } catch (error) {
      throw this.formatError(error, 'summarizeThread')
    }
  }

  async generateSmartReplies(
    request: SmartRepliesRequest
  ): Promise<AIResponse<SmartRepliesResponse>> {
    const count = request.count || 3
    const prompt = `Generate ${count} short, contextually appropriate reply options for this email:

From: ${request.from}
Subject: ${request.subject}
Body: ${request.body}

Return a JSON object with:
{
  "replies": [
    {"text": "reply text here", "tone": "professional|casual|friendly|formal", "confidence": 0.95},
    ...
  ]
}

Make replies diverse in tone and length. Keep them concise (1-2 sentences).`

    try {
      const response = await this.retry(async () => {
        return await this.client.chat.completions.create({
          model: request.model || this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert at generating contextually appropriate email replies.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.8,
          max_tokens: 512,
          response_format: { type: 'json_object' },
        })
      })

      const content = response.choices[0]?.message?.content || '{}'
      const parsed = JSON.parse(content) as SmartRepliesResponse

      const tokensUsed = response.usage?.total_tokens

      return this.wrapResponse(parsed, tokensUsed)
    } catch (error) {
      throw this.formatError(error, 'generateSmartReplies')
    }
  }

  async suggestLabels(
    request: SuggestLabelsRequest
  ): Promise<AIResponse<SuggestLabelsResponse>> {
    const maxSuggestions = request.maxSuggestions || 3
    const prompt = `Analyze this email and suggest appropriate labels from the available list:

Email:
From: ${request.from}
Subject: ${request.subject}
Body: ${request.body}

Available labels: ${request.existingLabels.join(', ')}

Return a JSON object with up to ${maxSuggestions} suggestions:
{
  "labels": [
    {"name": "label name", "confidence": 0.95, "reason": "why this label applies"},
    ...
  ]
}

Only suggest labels from the available list. Order by confidence (highest first).`

    try {
      const response = await this.retry(async () => {
        return await this.client.chat.completions.create({
          model: request.model || this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert at categorizing and labeling emails accurately.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.1,
          max_tokens: 512,
          response_format: { type: 'json_object' },
        })
      })

      const content = response.choices[0]?.message?.content || '{}'
      const parsed = JSON.parse(content) as SuggestLabelsResponse

      const tokensUsed = response.usage?.total_tokens

      return this.wrapResponse(parsed, tokensUsed)
    } catch (error) {
      throw this.formatError(error, 'suggestLabels')
    }
  }

  estimateCost(operation: string, inputLength: number): CostEstimate {
    const tokens = this.estimateTokens(operation + ' ' + inputLength.toString())

    // November 2025 pricing (verify at openai.com/api/pricing)
    let costPerMillionTokens = 0.375

    if (this.config.model.includes('gpt-5-mini') || this.config.model.includes('5-mini')) {
      // GPT-5 Mini: $0.25 input / $2.00 output per MTok
      costPerMillionTokens = 1.125 // Average
    } else if (this.config.model.includes('gpt-4o') && !this.config.model.includes('mini')) {
      // GPT-4o: $2.50 input / $10.00 output per MTok
      costPerMillionTokens = 6.25 // Average
    } else if (this.config.model.includes('4o-mini')) {
      // GPT-4o-mini: $0.15 input / $0.60 output per MTok
      costPerMillionTokens = 0.375 // Average
    }

    const estimatedCost = (tokens / 1000000) * costPerMillionTokens

    return {
      provider: 'openai',
      model: this.config.model,
      estimatedTokens: tokens,
      estimatedCost,
      currency: 'USD',
    }
  }

  protected calculateCost(tokensUsed: number): number {
    // November 2025 pricing
    if (this.config.model.includes('gpt-5-mini') || this.config.model.includes('5-mini')) {
      // GPT-5 Mini: ~$1.125 per million tokens (average)
      return (tokensUsed / 1000000) * 1.125
    }
    if (this.config.model.includes('4o-mini')) {
      // GPT-4o-mini: ~$0.375 per million tokens (average)
      return (tokensUsed / 1000000) * 0.375
    }
    if (this.config.model.includes('4o')) {
      // GPT-4o: ~$6.25 per million tokens (average)
      return (tokensUsed / 1000000) * 6.25
    }
    // Default fallback
    return (tokensUsed / 1000000) * 0.75
  }

  // Helper methods for building prompts (similar to Gemini)

  private buildDraftEmailPrompt(request: DraftEmailRequest): string {
    let prompt = `Generate a ${request.tone} email with the following details:

Purpose: ${request.purpose}
Context: ${request.context}
Tone: ${request.tone}
Length: ${request.length}
`

    if (request.replyTo) {
      prompt += `
This is a reply to:
From: ${request.replyTo.from}
Subject: ${request.replyTo.subject}
Body: ${request.replyTo.body}
`
    }

    prompt += `
Return a JSON object with:
{
  "subject": "email subject line",
  "body": "complete email body",
  "confidence": 0.95
}

For ${request.length} length:
- short: 2-3 sentences
- medium: 1-2 paragraphs
- long: 3-4 paragraphs`

    return prompt
  }

  private buildSummarizeEmailPrompt(request: SummarizeEmailRequest): string {
    let prompt = `Summarize this email concisely:

From: ${request.from}
Subject: ${request.subject}
Body: ${request.body}

Return a JSON object with:
{
  "summary": "2-3 sentence summary"
`

    if (request.includeActionItems) {
      prompt += `,
  "actionItems": ["action 1", "action 2", ...]`
    }

    if (request.includeKeyPoints) {
      prompt += `,
  "keyPoints": ["point 1", "point 2", ...]`
    }

    prompt += `,
  "deadline": "extracted deadline or null"
}`

    return prompt
  }

  private buildAnalyzeEmailPrompt(request: AnalyzeEmailRequest): string {
    const analyses = []
    if (request.analyzePriority) analyses.push('priority')
    if (request.analyzeSentiment) analyses.push('sentiment')
    if (request.extractActions) analyses.push('action items')
    if (request.classifyCategory) analyses.push('category')

    let prompt = `Analyze this email for: ${analyses.join(', ')}

From: ${request.from}
Subject: ${request.subject}
Body: ${request.body}

Return a JSON object with:`

    if (request.analyzePriority) {
      prompt += `
  "priority": "low|medium|high|urgent",
  "priorityConfidence": 0.95,`
    }

    if (request.analyzeSentiment) {
      prompt += `
  "sentiment": "positive|neutral|negative|mixed",
  "sentimentConfidence": 0.95,`
    }

    if (request.extractActions) {
      prompt += `
  "actionItems": [
    {"task": "description", "deadline": "date or null", "priority": "low|medium|high"}
  ],`
    }

    if (request.classifyCategory) {
      prompt += `
  "category": "personal|work|finance|shopping|social|promotions|updates|newsletters|notifications",
  "categoryConfidence": 0.95,`
    }

    prompt += `
  "isSpam": false,
  "spamConfidence": 0.05
}`

    return prompt
  }
}
