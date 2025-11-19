/**
 * API route for email analysis (priority, sentiment, actions, category)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/lib/ai/ai-manager'
import { generateCacheKey, getCachedResponse, setCachedResponse } from '@/lib/ai/cache/response-cache'
import type { AnalyzeEmailRequest, AnalyzeEmailResponse } from '@/lib/ai/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      from,
      subject,
      body: emailBody,
      analyzePriority = true,
      analyzeSentiment = true,
      extractActions = true,
      classifyCategory = true,
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
    const cacheKey = generateCacheKey('analyze', {
      from,
      subject,
      body: emailBody,
      analyzePriority,
      analyzeSentiment,
      extractActions,
      classifyCategory,
    })

    const cached = getCachedResponse<AnalyzeEmailResponse>('analyze', cacheKey)
    if (cached) {
      return NextResponse.json({
        success: true,
        ...cached,
      })
    }

    // Create request
    const analyzeRequest: AnalyzeEmailRequest = {
      from,
      subject,
      body: emailBody,
      analyzePriority,
      analyzeSentiment,
      extractActions,
      classifyCategory,
    }

    // Call AI provider
    const response = await provider.analyzeEmail(analyzeRequest)

    // Cache the response (longer TTL for analysis)
    setCachedResponse('analyze', cacheKey, response, 1000 * 60 * 60 * 24 * 7) // 7 days

    return NextResponse.json({
      success: true,
      ...response,
    })
  } catch (error) {
    console.error('Email analysis error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze email',
      },
      { status: 500 }
    )
  }
}
