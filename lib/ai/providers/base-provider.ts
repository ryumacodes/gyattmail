/**
 * Base AI provider interface
 * All AI providers must implement this interface
 */

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

export abstract class BaseAIProvider {
  protected config: AIConfig

  constructor(config: AIConfig) {
    this.config = config
  }

  /**
   * Get provider name
   */
  abstract getProviderName(): string

  /**
   * Validate API key and configuration
   */
  abstract validateConfig(): Promise<boolean>

  /**
   * Email composition methods
   */

  /**
   * Generate a complete email draft from a prompt
   */
  abstract draftEmail(
    request: DraftEmailRequest
  ): Promise<AIResponse<DraftEmailResponse>>

  /**
   * Improve existing email text
   */
  abstract improveText(
    request: ImproveTextRequest
  ): Promise<AIResponse<ImproveTextResponse>>

  /**
   * Adjust the tone of email text
   */
  abstract adjustTone(
    request: AdjustToneRequest
  ): Promise<AIResponse<AdjustToneResponse>>

  /**
   * Auto-complete email text (context-aware)
   */
  abstract completeText(
    text: string,
    context?: string
  ): Promise<AIResponse<string>>

  /**
   * Email analysis methods
   */

  /**
   * Summarize an email
   */
  abstract summarizeEmail(
    request: SummarizeEmailRequest
  ): Promise<AIResponse<SummarizeEmailResponse>>

  /**
   * Analyze email for priority, sentiment, actions, etc.
   */
  abstract analyzeEmail(
    request: AnalyzeEmailRequest
  ): Promise<AIResponse<AnalyzeEmailResponse>>

  /**
   * Summarize an entire email thread
   */
  abstract summarizeThread(
    request: SummarizeThreadRequest
  ): Promise<AIResponse<SummarizeThreadResponse>>

  /**
   * Smart suggestions methods
   */

  /**
   * Generate smart reply suggestions
   */
  abstract generateSmartReplies(
    request: SmartRepliesRequest
  ): Promise<AIResponse<SmartRepliesResponse>>

  /**
   * Suggest labels for an email
   */
  abstract suggestLabels(
    request: SuggestLabelsRequest
  ): Promise<AIResponse<SuggestLabelsResponse>>

  /**
   * Utility methods
   */

  /**
   * Estimate cost for a request
   */
  abstract estimateCost(
    operation: string,
    inputLength: number
  ): CostEstimate

  /**
   * Count tokens in text (approximate)
   */
  protected estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token for English
    // More sophisticated implementations can use tiktoken or provider-specific APIs
    return Math.ceil(text.length / 4)
  }

  /**
   * Get current configuration
   */
  getConfig(): AIConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<AIConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  /**
   * Format error messages consistently
   */
  protected formatError(error: any, operation: string): Error {
    const message = error?.message || 'Unknown error occurred'
    return new Error(`${this.getProviderName()} ${operation} failed: ${message}`)
  }

  /**
   * Wrap response with metadata
   */
  protected wrapResponse<T>(
    data: T,
    tokensUsed?: number,
    cached: boolean = false
  ): AIResponse<T> {
    const estimatedCost = tokensUsed
      ? this.calculateCost(tokensUsed)
      : undefined

    return {
      data,
      provider: this.config.provider,
      model: this.config.model,
      tokensUsed,
      estimatedCost,
      cached,
      timestamp: Date.now(),
    }
  }

  /**
   * Calculate cost based on tokens used
   * Each provider should override with actual pricing
   */
  protected calculateCost(tokensUsed: number): number {
    // Default implementation - providers should override
    return 0
  }

  /**
   * Retry logic with exponential backoff
   */
  protected async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error

        // Don't retry on certain errors
        if (
          error instanceof Error &&
          (error.message.includes('Invalid') ||
            error.message.includes('Unauthorized'))
        ) {
          throw error
        }

        // Wait before retrying (exponential backoff)
        if (i < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, i)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError || new Error('Max retries exceeded')
  }
}
