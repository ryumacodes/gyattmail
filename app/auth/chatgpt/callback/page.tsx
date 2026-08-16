'use client'

import { useSignInWithChatGPT } from '@openai-oauth/react'

export default function ChatGPTCallbackPage() {
  const login = useSignInWithChatGPT()

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper-100 p-6 text-ink-700">
      <div className="max-w-sm rounded border border-hatch-400 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold">Connecting ChatGPT</h1>
        <p className="mt-2 text-sm text-ink-500">
          {login.status === 'error'
            ? login.error.message
            : login.status === 'signed-in'
              ? 'Connected. You can close this window.'
              : 'Finishing secure sign-in…'}
        </p>
      </div>
    </main>
  )
}
