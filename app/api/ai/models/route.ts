import { NextRequest, NextResponse } from 'next/server'

interface OpenRouterModel {
  id: string
  name: string
  pricing?: {
    prompt?: string
    completion?: string
  }
  supported_parameters?: string[]
}

const ROUTERS = [
  { id: 'openrouter/free', name: 'OpenRouter Free Router', free: true },
  { id: 'openrouter/auto', name: 'OpenRouter Auto Router', free: false },
]

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get('provider') !== 'openrouter') {
    return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
  }

  try {
    const response = await fetch(
      'https://openrouter.ai/api/v1/models?output_modalities=text&sort=most-popular',
      { next: { revalidate: 60 * 60 } }
    )
    if (!response.ok) throw new Error(`OpenRouter returned ${response.status}`)

    const payload = await response.json() as { data?: OpenRouterModel[] }
    const models = (payload.data ?? [])
      .filter((model) => model.supported_parameters?.includes('response_format'))
      .map((model) => ({
        id: model.id,
        name: model.name,
        free: model.id.endsWith(':free') || (
          Number(model.pricing?.prompt ?? 1) === 0 &&
          Number(model.pricing?.completion ?? 1) === 0
        ),
      }))
      .sort((a, b) => Number(b.free) - Number(a.free))
      .slice(0, 150)

    return NextResponse.json({ models: [...ROUTERS, ...models] })
  } catch (error) {
    console.error('Failed to load OpenRouter models:', error)
    return NextResponse.json({ models: ROUTERS, stale: true })
  }
}
