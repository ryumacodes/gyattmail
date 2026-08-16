'use client'

import { openaiAuthHeaders } from '@openai-oauth/react'

export async function aiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const headers = await openaiAuthHeaders({
    headers: init.headers,
    optional: true,
  })

  return fetch(input, { ...init, headers })
}
