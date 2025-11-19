/**
 * Google Gemini AI provider implementation
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
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

export class GeminiProvider extends BaseAIProvider {
  private client: GoogleGenerativeAI

  constructor(config: AIConfig) {
    super(config)
    this.client = new GoogleGenerativeAI(config.apiKey)
  }

  getProviderName(): string {
    return 'Gemini'
  }

  async validateConfig(): Promise<boolean> {
    try {
      const model = this.client.getGenerativeModel({ model: this.config.model })
      const result = await model.generateContent('Test')
      return !!result.response.text()
    } catch (error) {
      return false
    }
  }

  async draftEmail(
    request: DraftEmailRequest
  ): Promise<AIResponse<DraftEmailResponse>> {
    const model = this.client.getGenerativeModel({
      model: request.model || this.config.model,
      generationConfig: {
        temperature: this.config.temperature ?? 0.7,
        maxOutputTokens: this.config.maxTokens ?? 2048,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM,
        },
      ],
    })

    const prompt = this.buildDraftEmailPrompt(request)

    try {
      const result = await this.retry(async () => {
        return await model.generateContent(prompt)
      })

      const response = result.response
      const text = response.text()

      // Parse JSON response
      const parsed = this.parseJSONResponse<DraftEmailResponse>(text)

      const tokensUsed = response.usageMetadata?.totalTokenCount

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
    const model = this.client.getGenerativeModel({
      model: request.model || this.config.model,
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent improvements
        maxOutputTokens: this.config.maxTokens ?? 2048,
      },
    })

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
}

Only return valid JSON, no other text.`

    try {
      const result = await this.retry(async () => {
        return await model.generateContent(prompt)
      })

      const response = result.response
      const text = response.text()
      const parsed = this.parseJSONResponse<ImproveTextResponse>(text)

      const tokensUsed = response.usageMetadata?.totalTokenCount

      return this.wrapResponse(parsed, tokensUsed)
    } catch (error) {
      throw this.formatError(error, 'improveText')
    }
  }

  async adjustTone(
    request: AdjustToneRequest
  ): Promise<AIResponse<AdjustToneResponse>> {
    const model = this.client.getGenerativeModel({
      model: request.model || this.config.model,
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: this.config.maxTokens ?? 2048,
      },
    })

    const prompt = `Adjust the tone of the following email text to be ${request.targetTone}:

Original text:
${request.text}

Return a JSON object with:
{
  "adjustedText": "the text with adjusted tone",
  "originalTone": "detected original tone",
  "targetTone": "${request.targetTone}"
}

Only return valid JSON, no other text.`

    try {
      const result = await this.retry(async () => {
        return await model.generateContent(prompt)
      })

      const response = result.response
      const text = response.text()
      const parsed = this.parseJSONResponse<AdjustToneResponse>(text)

      const tokensUsed = response.usageMetadata?.totalTokenCount

      return this.wrapResponse(parsed, tokensUsed)
    } catch (error) {
      throw this.formatError(error, 'adjustTone')
    }
  }

  async completeText(
    text: string,
    context?: string
  ): Promise<AIResponse<string>> {
    const model = this.client.getGenerativeModel({
      model: this.config.model,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 256, // Shorter for completions
      },
    })

    const prompt = context
      ? `Context: ${context}\n\nComplete this email text naturally:\n${text}`
      : `Complete this email text naturally:\n${text}`

    try {
      const result = await this.retry(async () => {
        return await model.generateContent(prompt)
      })

      const response = result.response
      const completion = response.text().trim()
      const tokensUsed = response.usageMetadata?.totalTokenCount

      return this.wrapResponse(completion, tokensUsed)
    } catch (error) {
      throw this.formatError(error, 'completeText')
    }
  }

  async summarizeEmail(
    request: SummarizeEmailRequest
  ): Promise<AIResponse<SummarizeEmailResponse>> {
    const model = this.client.getGenerativeModel({
      model: request.model || this.config.model,
      generationConfig: {
        temperature: 0.2, // Lower temperature for factual summaries
        maxOutputTokens: 512,
      },
    })

    const prompt = this.buildSummarizeEmailPrompt(request)

    try {
      const result = await this.retry(async () => {
        return await model.generateContent(prompt)
      })

      const response = result.response
      const text = response.text()
      const parsed = this.parseJSONResponse<SummarizeEmailResponse>(text)

      const tokensUsed = response.usageMetadata?.totalTokenCount

      return this.wrapResponse(parsed, tokensUsed)
    } catch (error) {
      throw this.formatError(error, 'summarizeEmail')
    }
  }

  async analyzeEmail(
    request: AnalyzeEmailRequest
  ): Promise<AIResponse<AnalyzeEmailResponse>> {
    const model = this.client.getGenerativeModel({
      model: request.model || this.config.model,
      generationConfig: {
        temperature: 0.1, // Very low temperature for consistent analysis
        maxOutputTokens: 1024,
      },
    })

    const prompt = this.buildAnalyzeEmailPrompt(request)

    try {
      const result = await this.retry(async () => {
        return await model.generateContent(prompt)
      })

      const response = result.response
      const text = response.text()
      const parsed = this.parseJSONResponse<AnalyzeEmailResponse>(text)

      const tokensUsed = response.usageMetadata?.totalTokenCount

      return this.wrapResponse(parsed, tokensUsed)
    } catch (error) {
      throw this.formatError(error, 'analyzeEmail')
    }
  }

  async summarizeThread(
    request: SummarizeThreadRequest
  ): Promise<AIResponse<SummarizeThreadResponse>> {
    const model = this.client.getGenerativeModel({
      model: request.model || this.config.model,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
      },
    })

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
}

Only return valid JSON, no other text.`

    try {
      const result = await this.retry(async () => {
        return await model.generateContent(prompt)
      })

      const response = result.response
      const text = response.text()
      const parsed = this.parseJSONResponse<SummarizeThreadResponse>(text)

      const tokensUsed = response.usageMetadata?.totalTokenCount

      return this.wrapResponse(parsed, tokensUsed)
    } catch (error) {
      throw this.formatError(error, 'summarizeThread')
    }
  }

  async generateSmartReplies(
    request: SmartRepliesRequest
  ): Promise<AIResponse<SmartRepliesResponse>> {
    const model = this.client.getGenerativeModel({
      model: request.model || this.config.model,
      generationConfig: {
        temperature: 0.8, // Higher temperature for variety
        maxOutputTokens: 512,
      },
    })

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

Make replies diverse in tone and length. Keep them concise (1-2 sentences).
Only return valid JSON, no other text.`

    try {
      const result = await this.retry(async () => {
        return await model.generateContent(prompt)
      })

      const response = result.response
      const text = response.text()
      const parsed = this.parseJSONResponse<SmartRepliesResponse>(text)

      const tokensUsed = response.usageMetadata?.totalTokenCount

      return this.wrapResponse(parsed, tokensUsed)
    } catch (error) {
      throw this.formatError(error, 'generateSmartReplies')
    }
  }

  async suggestLabels(
    request: SuggestLabelsRequest
  ): Promise<AIResponse<SuggestLabelsResponse>> {
    const model = this.client.getGenerativeModel({
      model: request.model || this.config.model,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 512,
      },
    })

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

Only suggest labels from the available list. Order by confidence (highest first).
Only return valid JSON, no other text.`

    try {
      const result = await this.retry(async () => {
        return await model.generateContent(prompt)
      })

      const response = result.response
      const text = response.text()
      const parsed = this.parseJSONResponse<SuggestLabelsResponse>(text)

      const tokensUsed = response.usageMetadata?.totalTokenCount

      return this.wrapResponse(parsed, tokensUsed)
    } catch (error) {
      throw this.formatError(error, 'suggestLabels')
    }
  }

  estimateCost(operation: string, inputLength: number): CostEstimate {
    const tokens = this.estimateTokens(operation + ' ' + inputLength.toString())

    // Gemini 2.0 Flash pricing (as of Dec 2024)
    // Free tier: 15 RPM, 1.5M tokens/day
    // Paid tier: $0.30 per million tokens (input + output combined)
    const costPerMillionTokens = 0.30
    const estimatedCost = (tokens / 1000000) * costPerMillionTokens

    return {
      provider: 'gemini',
      model: this.config.model,
      estimatedTokens: tokens,
      estimatedCost,
      currency: 'USD',
    }
  }

  protected calculateCost(tokensUsed: number): number {
    // Gemini 2.0 Flash: $0.30 per million tokens
    return (tokensUsed / 1000000) * 0.30
  }

  // Helper methods for building prompts

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
- long: 3-4 paragraphs

Only return valid JSON, no other text.`

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
}

Only return valid JSON, no other text.`

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
}

Only return valid JSON, no other text.`

    return prompt
  }

  private parseJSONResponse<T>(text: string): T {
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
      const jsonText = jsonMatch ? jsonMatch[1] : text

      // Remove any trailing/leading whitespace
      const cleaned = jsonText.trim()

      return JSON.parse(cleaned)
    } catch (error) {
      // If parsing fails, try to find JSON object in the text
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          return JSON.parse(match[0])
        } catch {
          throw new Error(`Failed to parse JSON from response: ${text.substring(0, 200)}`)
        }
      }
      throw new Error(`No valid JSON found in response: ${text.substring(0, 200)}`)
    }
  }
}
