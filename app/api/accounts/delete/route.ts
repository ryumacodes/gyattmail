/**
 * Delete email account endpoint
 */

import { NextRequest, NextResponse } from 'next/server'
import { deleteAccount } from '@/lib/storage/account-storage'

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { accountId, email } = body

    if (!accountId && !email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account ID or email is required',
        },
        { status: 400 }
      )
    }

    // If email is provided instead of accountId, find the account
    let targetAccountId = accountId
    if (!targetAccountId && email) {
      const { getAccountsByEmail } = await import('@/lib/storage/account-storage')
      const accounts = await getAccountsByEmail(email)
      if (accounts.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Account not found',
          },
          { status: 404 }
        )
      }
      targetAccountId = accounts[0].id
    }

    const deleted = await deleteAccount(targetAccountId)

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    })
  } catch (error) {
    console.error('Failed to delete account:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete account',
      },
      { status: 500 }
    )
  }
}
