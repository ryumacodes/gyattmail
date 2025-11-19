/**
 * API route for email summarization
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/lib/ai/ai-manager'
import { generateCacheKey, getCachedResponse, setCachedResponse } from '@/lib/ai/cache/response-cache'
import type { SummarizeEmailRequest, SummarizeEmailResponse } from '@/lib/ai/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      from,
      subject,
      body: emailBody,
      includeActionItems = true,
      includeKeyPoints = true,
    } = body

    // Validate required fields
    if (!from || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Missing required fields: from, subject, body' },
        { status: 400 }
      )
    }

    // Get AI provider
    const provider = await getAIProvider()
    if (!provider) {
      return NextResponse.json(
        { error: 'AI provider not configured. Please configure an AI provider in settings.' },
        { status: 503 }
      )
    }

    // Check cache first
    const cacheKey = generateCacheKey('summarize', {
      from,
      subject,
      body: emailBody,
      includeActionItems,
      includeKeyPoints,
    })

    const cached = getCachedResponse<SummarizeEmailResponse>('summarize', cacheKey)
    if (cached) {
      return NextResponse.json({
        success: true,
        ...cached,
      })
    }

    // Create request
    const summarizeRequest: SummarizeEmailRequest = {
      from,
      subject,
      body: emailBody,
      includeActionItems,
      includeKeyPoints,
    }

    // Call AI provider
    const response = await provider.summarizeEmail(summarizeRequest)

    // Cache the response
    setCachedResponse('summarize', cacheKey, response)

    return NextResponse.json({
      success: true,
      ...response,
    })
  } catch (error) {
    console.error('Email summarization error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to summarize email',
      },
      { status: 500 }
    )
  }
}
