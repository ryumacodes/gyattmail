/**
 * API route for AI tone adjustment
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAIProvider } from '@/lib/ai/ai-manager'
import type { AdjustToneRequest, AdjustToneResponse, EmailTone } from '@/lib/ai/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      text,
      targetTone = 'professional' as EmailTone,
    } = body

    // Validate required fields
    if (!text || !targetTone) {
      return NextResponse.json(
        { error: 'Missing required fields: text, targetTone' },
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
    const adjustRequest: AdjustToneRequest = {
      text,
      targetTone,
    }

    // Call AI provider
    const response = await provider.adjustTone(adjustRequest)

    return NextResponse.json({
      success: true,
      ...response,
    })
  } catch (error) {
    console.error('Tone adjustment error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to adjust tone',
      },
      { status: 500 }
    )
  }
}
