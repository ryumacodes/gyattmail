/**
 * AI system types and interfaces
 */

export type AIProvider = 'gemini' | 'openai' | 'claude' | 'openrouter'

export type AIModel = {
  gemini: 'gemini-2.5-flash-preview-05-20' | 'gemini-1.5-pro' | 'gemini-1.5-flash'
  openai: 'gpt-5-mini' | 'gpt-4o' | 'gpt-4o-mini'
  claude: 'claude-3-5-sonnet-20241022' | 'claude-3-5-haiku-20241022' | 'claude-3-opus-20240229'
}

export type EmailTone = 'professional' | 'casual' | 'friendly' | 'formal' | 'concise' | 'enthusiastic'

export type EmailLength = 'short' | 'medium' | 'long'

export type EmailPriority = 'low' | 'medium' | 'high' | 'urgent'

export type EmailSentiment = 'positive' | 'neutral' | 'negative' | 'mixed'

export type EmailCategory =
  | 'personal'
  | 'work'
  | 'finance'
  | 'shopping'
  | 'social'
  | 'promotions'
  | 'updates'
  | 'newsletters'
  | 'notifications'

/**
 * AI provider configuration
 */
export interface AIConfig {
  provider: AIProvider
  model: string
  apiKey: string
  temperature?: number
  maxTokens?: number
  enableCaching?: boolean
  costLimit?: number // Monthly cost limit in USD
}

/**
 * Base AI request interface
 */
export interface AIRequest {
  provider?: AIProvider
  model?: string
  cacheKey?: string
}

/**
 * AI response with metadata
 */
export interface AIResponse<T = any> {
  data: T
  provider: AIProvider
  model: string
  tokensUsed?: number
  estimatedCost?: number
  cached?: boolean
  timestamp: number
}

/**
 * Email composition requests
 */
export interface DraftEmailRequest extends AIRequest {
  context: string
  purpose: string
  tone: EmailTone
  length: EmailLength
  replyTo?: {
    from: string
    subject: string
    body: string
  }
}

export interface DraftEmailResponse {
  subject: string
  body: string
  confidence: number
}

export interface ImproveTextRequest extends AIRequest {
  text: string
  improvements: ('grammar' | 'clarity' | 'conciseness' | 'tone')[]
}

export interface ImproveTextResponse {
  improvedText: string
  changes: Array<{
    original: string
    improved: string
    reason: string
  }>
}

export interface AdjustToneRequest extends AIRequest {
  text: string
  targetTone: EmailTone
}

export interface AdjustToneResponse {
  adjustedText: string
  originalTone: EmailTone
  targetTone: EmailTone
}

/**
 * Email analysis requests
 */
export interface SummarizeEmailRequest extends AIRequest {
  from: string
  subject: string
  body: string
  includeActionItems?: boolean
  includeKeyPoints?: boolean
}

export interface SummarizeEmailResponse {
  summary: string
  actionItems?: string[]
  keyPoints?: string[]
  deadline?: string
}

export interface AnalyzeEmailRequest extends AIRequest {
  from: string
  subject: string
  body: string
  analyzePriority?: boolean
  analyzeSentiment?: boolean
  extractActions?: boolean
  classifyCategory?: boolean
}

export interface AnalyzeEmailResponse {
  priority?: EmailPriority
  priorityConfidence?: number
  sentiment?: EmailSentiment
  sentimentConfidence?: number
  actionItems?: Array<{
    task: string
    deadline?: string
    priority?: 'low' | 'medium' | 'high'
  }>
  category?: EmailCategory
  categoryConfidence?: number
  isSpam?: boolean
  spamConfidence?: number
}

/**
 * Smart suggestion requests
 */
export interface SmartRepliesRequest extends AIRequest {
  from: string
  subject: string
  body: string
  count?: number // Number of replies to generate (default: 3)
}

export interface SmartRepliesResponse {
  replies: Array<{
    text: string
    tone: EmailTone
    confidence: number
  }>
}

export interface SuggestLabelsRequest extends AIRequest {
  from: string
  subject: string
  body: string
  existingLabels: string[]
  maxSuggestions?: number
}

export interface SuggestLabelsResponse {
  labels: Array<{
    name: string
    confidence: number
    reason: string
  }>
}

export interface SuggestRecipientsRequest extends AIRequest {
  subject: string
  body: string
  from: string
  existingRecipients: string[]
  userContacts: Array<{
    email: string
    name: string
    frequency: number // How often emailed
  }>
}

export interface SuggestRecipientsResponse {
  cc: Array<{
    email: string
    reason: string
    confidence: number
  }>
  bcc: Array<{
    email: string
    reason: string
    confidence: number
  }>
}

/**
 * Batch operation requests
 */
export interface BatchSummarizeRequest extends AIRequest {
  emails: Array<{
    id: string
    from: string
    subject: string
    body: string
  }>
}

export interface BatchSummarizeResponse {
  summaries: Array<{
    emailId: string
    summary: string
    priority?: EmailPriority
  }>
}

export interface BatchLabelRequest extends AIRequest {
  emails: Array<{
    id: string
    from: string
    subject: string
    body: string
  }>
  existingLabels: string[]
}

export interface BatchLabelResponse {
  labels: Array<{
    emailId: string
    suggestedLabels: string[]
    confidence: number[]
  }>
}

/**
 * Thread analysis
 */
export interface SummarizeThreadRequest extends AIRequest {
  emails: Array<{
    from: string
    to: string[]
    date: string
    subject: string
    body: string
  }>
}

export interface SummarizeThreadResponse {
  threadSummary: string
  participants: string[]
  keyTopics: string[]
  actionItems: Array<{
    task: string
    assignedTo?: string
    deadline?: string
  }>
  sentiment: EmailSentiment
}

/**
 * AI usage tracking
 */
export interface AIUsageStats {
  provider: AIProvider
  totalRequests: number
  totalTokens: number
  totalCost: number
  requestsByType: Record<string, number>
  averageLatency: number
  cacheHitRate: number
  errorRate: number
}

/**
 * Cost estimation
 */
export interface CostEstimate {
  provider: AIProvider
  model: string
  estimatedTokens: number
  estimatedCost: number
  currency: 'USD'
}

/**
 * Error types
 */
export class AIError extends Error {
  constructor(
    message: string,
    public provider: AIProvider,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'AIError'
  }
}

export class AIQuotaExceededError extends AIError {
  constructor(provider: AIProvider) {
    super(
      `AI quota exceeded for ${provider}. Please check your API limits.`,
      provider,
      'QUOTA_EXCEEDED',
      false
    )
    this.name = 'AIQuotaExceededError'
  }
}

export class AIRateLimitError extends AIError {
  constructor(provider: AIProvider, retryAfter?: number) {
    super(
      `Rate limit exceeded for ${provider}. ${retryAfter ? `Retry after ${retryAfter}s` : 'Please try again later.'}`,
      provider,
      'RATE_LIMIT',
      true
    )
    this.name = 'AIRateLimitError'
  }
}

export class AIInvalidRequestError extends AIError {
  constructor(provider: AIProvider, details: string) {
    super(
      `Invalid request to ${provider}: ${details}`,
      provider,
      'INVALID_REQUEST',
      false
    )
    this.name = 'AIInvalidRequestError'
  }
}
