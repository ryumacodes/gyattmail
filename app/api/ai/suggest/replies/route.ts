/**
 * API route for smart reply suggestions
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/lib/ai/ai-manager'
import { generateCacheKey, getCachedResponse, setCachedResponse } from '@/lib/ai/cache/response-cache'
import type { SmartRepliesRequest, SmartRepliesResponse } from '@/lib/ai/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      from,
      subject,
      body: emailBody,
      count = 3,
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
    const cacheKey = generateCacheKey('replies', {
      from,
      subject,
      body: emailBody,
      count,
    })

    const cached = getCachedResponse<SmartRepliesResponse>('replies', cacheKey)
    if (cached) {
      return NextResponse.json({
        success: true,
        ...cached,
      })
    }

    // Create request
    const repliesRequest: SmartRepliesRequest = {
      from,
      subject,
      body: emailBody,
      count,
    }

    // Call AI provider
    const response = await provider.generateSmartReplies(repliesRequest)

    // Cache the response (30 minutes)
    setCachedResponse('replies', cacheKey, response, 1000 * 60 * 30)

    return NextResponse.json({
      success: true,
      ...response,
    })
  } catch (error) {
    console.error('Smart replies generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate smart replies',
      },
      { status: 500 }
    )
  }
}
