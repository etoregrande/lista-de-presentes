import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { seal, unseal } from './crypto'

export const OAUTH_COOKIE = 'presenteio-ml-oauth'
const attemptSchema = z.object({
  state: z.string(),
  verifier: z.string(),
  userId: z.string(),
  expiresAt: z.number(),
})
export const tokenSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  expires_in: z.number().positive(),
  user_id: z.number().optional(),
})

export function isIntegrationAdmin(email: string) {
  const admin = process.env.MERCADOLIVRE_ADMIN_EMAIL?.trim().toLowerCase()
  return Boolean(admin && email.toLowerCase() === admin)
}

export function oauthConfig() {
  const clientId = process.env.MERCADOLIVRE_CLIENT_ID
  const clientSecret = process.env.MERCADOLIVRE_CLIENT_SECRET
  const redirectUri = process.env.MERCADOLIVRE_REDIRECT_URI
  if (
    !clientId ||
    !clientSecret ||
    !redirectUri ||
    !process.env.MERCADOLIVRE_ADMIN_EMAIL
  )
    throw new Error('ML_NOT_CONFIGURED')
  const callback = new URL(redirectUri)
  if (
    callback.protocol !== 'https:' ||
    callback.pathname !== '/api/integrations/mercadolivre/callback' ||
    callback.search ||
    callback.hash ||
    callback.username ||
    callback.password
  )
    throw new Error('ML_INVALID_REDIRECT')
  return { clientId, clientSecret, redirectUri }
}

export function beginAuthorization(userId: string) {
  const { clientId, redirectUri } = oauthConfig()
  const state = randomBytes(32).toString('base64url')
  const verifier = randomBytes(48).toString('base64url')
  const url = new URL('https://auth.mercadolivre.com.br/authorization')
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    code_challenge: createHash('sha256').update(verifier).digest('base64url'),
    code_challenge_method: 'S256',
  }).toString()
  return {
    url: url.href,
    cookie: seal(
      { state, verifier, userId, expiresAt: Date.now() + 600_000 },
      'oauth'
    ),
  }
}

export function verifyAuthorization(
  cookie: string,
  state: string,
  userId: string
) {
  const attempt = attemptSchema.parse(unseal(cookie, 'oauth'))
  const actual = Buffer.from(state)
  const expected = Buffer.from(attempt.state)
  if (
    attempt.userId !== userId ||
    attempt.expiresAt <= Date.now() ||
    actual.length !== expected.length ||
    !timingSafeEqual(actual, expected)
  )
    throw new Error('ML_INVALID_STATE')
  return attempt.verifier
}

export async function requestTokens(grant: Record<string, string>) {
  const { clientId, clientSecret } = oauthConfig()
  const response = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(10000),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      ...grant,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })
  if (!response.ok) throw new Error('ML_AUTHORIZATION_FAILED')
  return tokenSchema.parse(await response.json())
}
