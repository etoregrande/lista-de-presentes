import { NextRequest, NextResponse } from 'next/server'
import { getSessionOnServer } from '@/server/session'
import {
  isIntegrationAdmin,
  oauthConfig,
  OAUTH_COOKIE,
  requestTokens,
  verifyAuthorization,
} from '@/lib/mercadolivre/oauth'
import { storeTokens } from '@/lib/mercadolivre/client'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const session = await getSessionOnServer()
  let connected = false
  try {
    if (!session || !isIntegrationAdmin(session.user.email))
      throw new Error('FORBIDDEN')
    const state = request.nextUrl.searchParams.get('state') ?? ''
    const cookie = request.cookies.get(OAUTH_COOKIE)?.value ?? ''
    const verifier = verifyAuthorization(cookie, state, session.user.id)
    const code = request.nextUrl.searchParams.get('code')
    if (!code || request.nextUrl.searchParams.has('error'))
      throw new Error('DENIED')
    const tokens = await requestTokens({
      grant_type: 'authorization_code',
      code,
      code_verifier: verifier,
      redirect_uri: oauthConfig().redirectUri,
    })
    await storeTokens(tokens)
    connected = true
  } catch {
    // Do not log the URL, authorization code, tokens, or provider response.
    console.error('[mercadolivre] Authorization could not be completed')
  }
  const origin = process.env.MERCADOLIVRE_REDIRECT_URI
    ? new URL(process.env.MERCADOLIVRE_REDIRECT_URI).origin
    : request.nextUrl.origin
  const response = NextResponse.redirect(
    new URL(
      `/wishlist?mercadolivre=${connected ? 'connected' : 'error'}`,
      origin
    )
  )
  response.cookies.set(OAUTH_COOKIE, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/api/integrations/mercadolivre',
  })
  response.headers.set('Cache-Control', 'no-store')
  response.headers.set('Referrer-Policy', 'no-referrer')
  return response
}
