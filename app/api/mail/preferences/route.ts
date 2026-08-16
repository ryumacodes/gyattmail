import { NextRequest, NextResponse } from 'next/server'
import { getMailPreferences, saveMailPreferences } from '@/lib/storage/mail-preferences-storage'
import type { MailPreferences } from '@/lib/types/mail-preferences'

export async function GET() {
  return NextResponse.json({ success: true, preferences: await getMailPreferences() })
}

export async function PUT(request: NextRequest) {
  const preferences = await request.json() as MailPreferences
  return NextResponse.json({ success: true, preferences: await saveMailPreferences(preferences) })
}
