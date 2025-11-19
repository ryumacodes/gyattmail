/**
 * API route for AI text improvement
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/lib/ai/ai-manager'
import type { ImproveTextRequest, ImproveTextResponse } from '@/lib/ai/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      text,
      improvements = ['grammar', 'clarity', 'conciseness'],
    } = body

    // Validate required fields
    if (!text) {
      return NextResponse.json(
        { error: 'Missing required field: text' },
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

    // Create request
    const improveRequest: ImproveTextRequest = {
      text,
      improvements,
    }

    // Call AI provider
    const response = await provider.improveText(improveRequest)

    return NextResponse.json({
      success: true,
      ...response,
    })
  } catch (error) {
    console.error('Text improvement error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to improve text',
      },
      { status: 500 }
    )
  }
}
