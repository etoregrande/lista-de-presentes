'use server'

import { auth, Session } from '@/lib/auth'
import { headers } from 'next/headers'
import { NextRequest } from 'next/server'

export const getSessionOnServer = async (): Promise<Session | null> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    return session
  } catch (error) {
    console.error('Error getting session:', error)
    throw new Error('Unable to get session data')
  }
}

export const getServerUserId = async (request: NextRequest) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  })
  if (!session) {
    throw new Error('Unable to get user data')
  }
  return session.user.id
}
