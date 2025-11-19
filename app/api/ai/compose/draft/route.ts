/**
 * API route for AI email drafting
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/lib/ai/ai-manager'
import type { DraftEmailRequest, DraftEmailResponse, EmailTone, EmailLength } from '@/lib/ai/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      context,
      purpose,
      tone = 'professional' as EmailTone,
      length = 'medium' as EmailLength,
      replyTo,
    } = body

    // Validate required fields
    if (!purpose) {
      return NextResponse.json(
        { error: 'Missing required field: purpose' },
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
    const draftRequest: DraftEmailRequest = {
      context: context || '',
      purpose,
      tone,
      length,
      replyTo,
    }

    // Call AI provider (don't cache drafts - they should be unique)
    const response = await provider.draftEmail(draftRequest)

    return NextResponse.json({
      success: true,
      ...response,
    })
  } catch (error) {
    console.error('Email draft generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate email draft',
      },
      { status: 500 }
    )
  }
}
