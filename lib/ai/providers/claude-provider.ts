/**
 * Claude (Anthropic) AI provider implementation
 */

import Anthropic from '@anthropic-ai/sdk'
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

export class ClaudeProvider extends BaseAIProvider {
  protected client: Anthropic

  constructor(config: AIConfig) {
    super(config)
    this.client = new Anthropic({
      apiKey: config.apiKey,
    })
  }

  getProviderName(): string {
    return 'Claude'
  }

  async validateConfig(): Promise<boolean> {
    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: 5,
        messages: [{ role: 'user', content: 'Test' }],
      })
      return !!response.content[0]
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
        return await this.client.messages.create({
          model: request.model || this.config.model,
          max_tokens: this.config.maxTokens ?? 2048,
          temperature: this.config.temperature ?? 0.7,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          system: 'You are an expert email writing assistant. Generate professional, contextually appropriate emails in JSON format. Always respond with valid JSON only, no other text.',
        })
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response format')
      }

      const parsed = this.parseJSONResponse<DraftEmailResponse>(content.text)

      const tokensUsed =
        response.usage.input_tokens + response.usage.output_tokens

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
        return await this.client.messages.create({
          model: request.model || this.config.model,
          max_tokens: this.config.maxTokens ?? 2048,
          temperature: 0.3,
          messages: [{ role: 'user', content: prompt }],
          system: 'You are an expert writing editor. Improve email text and explain your changes. Respond with valid JSON only.',
        })
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response format')
      }

      const parsed = this.parseJSONResponse<ImproveTextResponse>(content.text)
      const tokensUsed =
        response.usage.input_tokens + response.usage.output_tokens

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
  "explanation": "brief explanation of tone changes made"
}`

    try {
      const response = await this.retry(async () => {
        return await this.client.messages.create({
          model: request.model || this.config.model,
          max_tokens: this.config.maxTokens ?? 2048,
          temperature: 0.5,
          messages: [{ role: 'user', content: prompt }],
          system: 'You are an expert in communication tone adjustment. Adjust email tone while preserving meaning. Respond with valid JSON only.',
        })
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response format')
      }

      const parsed = this.parseJSONResponse<AdjustToneResponse>(content.text)
      const tokensUsed =
        response.usage.input_tokens + response.usage.output_tokens

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
      ? `Context: ${context}\n\nComplete this email text:\n${text}`
      : `Complete this email text:\n${text}`

    try {
      const response = await this.retry(async () => {
        return await this.client.messages.create({
          model: this.config.model,
          max_tokens: 500,
          temperature: 0.7,
          messages: [{ role: 'user', content: prompt }],
          system: 'You are an email writing assistant. Complete the email text naturally and professionally.',
        })
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response format')
      }

      const tokensUsed =
        response.usage.input_tokens + response.usage.output_tokens

      return this.wrapResponse(content.text.trim(), tokensUsed)
    } catch (error) {
      throw this.formatError(error, 'completeText')
    }
  }

  async summarizeEmail(
    request: SummarizeEmailRequest
  ): Promise<AIResponse<SummarizeEmailResponse>> {
    const prompt = `Summarize this email:

From: ${request.from}
Subject: ${request.subject}
Body:
${request.body}

Return a JSON object with:
{
  "summary": "brief 1-2 sentence summary",
  "keyPoints": ["key point 1", "key point 2"],
  "estimatedReadTime": number of minutes to read
}`

    try {
      const response = await this.retry(async () => {
        return await this.client.messages.create({
          model: request.model || this.config.model,
          max_tokens: 1024,
          temperature: 0.3,
          messages: [{ role: 'user', content: prompt }],
          system: 'You are an expert email analyst. Provide concise, accurate summaries. Respond with valid JSON only.',
        })
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response format')
      }

      const parsed = this.parseJSONResponse<SummarizeEmailResponse>(content.text)
      const tokensUsed =
        response.usage.input_tokens + response.usage.output_tokens

      return this.wrapResponse(parsed, tokensUsed)
    } catch (error) {
      throw this.formatError(error, 'summarizeEmail')
    }
  }

  async analyzeEmail(
    request: AnalyzeEmailRequest
  ): Promise<AIResponse<AnalyzeEmailResponse>> {
    const analyses: string[] = []
    if (request.analyzePriority) analyses.push('priority level')
    if (request.analyzeSentiment) analyses.push('sentiment')
    if (request.extractActions) analyses.push('action items')
    if (request.classifyCategory) analyses.push('category')

    const prompt = `Analyze this email for ${analyses.join(', ')}:

From: ${request.from}
Subject: ${request.subject}
Body:
${request.body}

Return a JSON object with:
{
  ${request.analyzePriority ? '"priority": "low" | "medium" | "high" | "urgent",' : ''}
  ${request.analyzePriority ? '"priorityConfidence": 0.0-1.0,' : ''}
  ${request.analyzeSentiment ? '"sentiment": "positive" | "neutral" | "negative" | "mixed",' : ''}
  ${request.analyzeSentiment ? '"sentimentConfidence": 0.0-1.0,' : ''}
  ${request.extractActions ? '"actionItems": [{"task": "task description", "deadline": "date or null", "priority": "low|medium|high"}],' : ''}
  ${request.classifyCategory ? '"category": "category name",' : ''}
  ${request.classifyCategory ? '"categoryConfidence": 0.0-1.0' : ''}
}`

    try {
      const response = await this.retry(async () => {
        return await this.client.messages.create({
          model: request.model || this.config.model,
          max_tokens: 2048,
          temperature: 0.2,
          messages: [{ role: 'user', content: prompt }],
          system: 'You are an expert email analyst. Provide accurate, detailed analysis. Respond with valid JSON only.',
        })
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response format')
      }

      const parsed = this.parseJSONResponse<AnalyzeEmailResponse>(content.text)
      const tokensUsed =
        response.usage.input_tokens + response.usage.output_tokens

      return this.wrapResponse(parsed, tokensUsed)
    } catch (error) {
      throw this.formatError(error, 'analyzeEmail')
    }
  }

  async summarizeThread(
    request: SummarizeThreadRequest
  ): Promise<AIResponse<SummarizeThreadResponse>> {
    const emailsList = request.emails
      .map(
        (email, idx) => `
Email ${idx + 1}:
From: ${email.from}
Date: ${new Date(email.date).toLocaleString()}
${email.body}
---`
      )
      .join('\n')

    const prompt = `Summarize this email thread:

${emailsList}

Return a JSON object with:
{
  "overallSummary": "overall thread summary",
  "keyDecisions": ["decision 1", "decision 2"],
  "nextSteps": ["step 1", "step 2"],
  "participants": [{"email": "email@example.com", "role": "their role in thread"}]
}`

    try {
      const response = await this.retry(async () => {
        return await this.client.messages.create({
          model: request.model || this.config.model,
          max_tokens: 2048,
          temperature: 0.3,
          messages: [{ role: 'user', content: prompt }],
          system: 'You are an expert at analyzing email threads. Provide clear, concise thread summaries. Respond with valid JSON only.',
        })
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response format')
      }

      const parsed = this.parseJSONResponse<SummarizeThreadResponse>(
        content.text
      )
      const tokensUsed =
        response.usage.input_tokens + response.usage.output_tokens

      return this.wrapResponse(parsed, tokensUsed)
    } catch (error) {
      throw this.formatError(error, 'summarizeThread')
    }
  }

  async generateSmartReplies(
    request: SmartRepliesRequest
  ): Promise<AIResponse<SmartRepliesResponse>> {
    const prompt = `Generate ${request.count || 3} smart reply suggestions for this email:

From: ${request.from}
Subject: ${request.subject}
Body:
${request.body}

Return a JSON object with:
{
  "replies": [
    {"text": "reply text", "tone": "professional|casual|friendly", "confidence": 0.0-1.0}
  ]
}`

    try {
      const response = await this.retry(async () => {
        return await this.client.messages.create({
          model: request.model || this.config.model,
          max_tokens: 1024,
          temperature: 0.8,
          messages: [{ role: 'user', content: prompt }],
          system: 'You are an expert at crafting appropriate email replies. Generate diverse, contextually appropriate responses. Respond with valid JSON only.',
        })
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response format')
      }

      const parsed = this.parseJSONResponse<SmartRepliesResponse>(content.text)
      const tokensUsed =
        response.usage.input_tokens + response.usage.output_tokens

      return this.wrapResponse(parsed, tokensUsed)
    } catch (error) {
      throw this.formatError(error, 'generateSmartReplies')
    }
  }

  async suggestLabels(
    request: SuggestLabelsRequest
  ): Promise<AIResponse<SuggestLabelsResponse>> {
    const availableLabels = request.existingLabels?.join(', ') || 'any relevant labels'

    const prompt = `Suggest appropriate labels for this email:

From: ${request.from}
Subject: ${request.subject}
Body:
${request.body}

Available labels: ${availableLabels}

Return a JSON object with:
{
  "suggestedLabels": [
    {"label": "label name", "confidence": 0.0-1.0, "reason": "why this label applies"}
  ]
}`

    try {
      const response = await this.retry(async () => {
        return await this.client.messages.create({
          model: request.model || this.config.model,
          max_tokens: 1024,
          temperature: 0.3,
          messages: [{ role: 'user', content: prompt }],
          system: 'You are an expert at email categorization. Suggest accurate, helpful labels. Respond with valid JSON only.',
        })
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response format')
      }

      const parsed = this.parseJSONResponse<SuggestLabelsResponse>(content.text)
      const tokensUsed =
        response.usage.input_tokens + response.usage.output_tokens

      return this.wrapResponse(parsed, tokensUsed)
    } catch (error) {
      throw this.formatError(error, 'suggestLabels')
    }
  }

  estimateCost(operation: string, inputLength: number): CostEstimate {
    const estimatedTokens = this.estimateTokens(
      inputLength.toString().repeat(inputLength)
    )

    // Claude pricing (as of 2024)
    // Haiku: $0.25/$1.25 per MTok (in/out)
    // Sonnet: $3/$15 per MTok (in/out)
    // Opus: $15/$75 per MTok (in/out)
    const model = this.config.model.toLowerCase()
    let inputRate = 3.0 // Default to Sonnet
    let outputRate = 15.0

    if (model.includes('haiku')) {
      inputRate = 0.25
      outputRate = 1.25
    } else if (model.includes('opus')) {
      inputRate = 15.0
      outputRate = 75.0
    }

    const inputCost = (estimatedTokens / 1000000) * inputRate
    const outputCost = (estimatedTokens / 1000000) * outputRate

    return {
      provider: this.config.provider,
      model: this.config.model,
      estimatedTokens,
      estimatedCost: inputCost + outputCost,
      currency: 'USD' as const,
    }
  }

  protected calculateCost(tokensUsed: number): number {
    const model = this.config.model.toLowerCase()
    let avgRate = 9.0 // Average of input/output for Sonnet

    if (model.includes('haiku')) {
      avgRate = 0.75 // Average of $0.25 and $1.25
    } else if (model.includes('opus')) {
      avgRate = 45.0 // Average of $15 and $75
    }

    return (tokensUsed / 1000000) * avgRate
  }

  /**
   * Parse JSON response from Claude, handling potential markdown code blocks
   */
  private parseJSONResponse<T>(text: string): T {
    // Remove markdown code blocks if present
    let cleaned = text.trim()
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '')
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '')
    }

    try {
      return JSON.parse(cleaned) as T
    } catch (error) {
      console.error('Failed to parse JSON response:', cleaned)
      throw new Error('Invalid JSON response from Claude')
    }
  }

  /**
   * Build draft email prompt
   */
  private buildDraftEmailPrompt(request: DraftEmailRequest): string {
    let prompt = `Generate a ${request.tone} email with ${request.length} length.

Context: ${request.context}
Purpose: ${request.purpose}
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
  "body": "email body text",
  "confidence": 0.0-1.0 confidence score
}`

    return prompt
  }
}
