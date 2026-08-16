import { NextRequest, NextResponse } from 'next/server'
import { clearServerAIConfig, getServerAIConfig, saveServerAIConfig } from '@/lib/storage/ai-config-storage'
import type { AIConfig } from '@/lib/ai/types'

export async function GET() {
  const config = await getServerAIConfig()
  return NextResponse.json({
    configured: !!config,
    config: config ? { ...config, apiKey: '' } : null,
  })
}

export async function PUT(request: NextRequest) {
  let config = (await request.json()) as AIConfig
  if (config.apiKey === 'configured') {
    const existing = await getServerAIConfig()
    if (!existing || existing.provider !== config.provider) {
      return NextResponse.json({ error: 'Credentials are required for the selected provider' }, { status: 400 })
    }
    config = { ...config, apiKey: existing.apiKey }
  }
  if (!config.provider || !config.model || !config.apiKey) {
    return NextResponse.json({ error: 'Provider, model, and credentials are required' }, { status: 400 })
  }
  await saveServerAIConfig(config)
  return NextResponse.json({ success: true })
}

export async function DELETE() {
  await clearServerAIConfig()
  return NextResponse.json({ success: true })
}
