import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { seal, unseal } from './crypto'
import { requestTokens, tokenSchema } from './oauth'

const storedSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.number(),
})
const provider = 'mercadolivre'
const encryptedTokens = (tokens: z.infer<typeof tokenSchema>) =>
  seal(
    {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    },
    'tokens'
  )

export async function storeTokens(tokens: z.infer<typeof tokenSchema>) {
  // Same lock as renewal: a reconnect cannot race a rotating refresh token.
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(718421)`
    await tx.integrationCredential.upsert({
      where: { provider },
      create: { provider, encrypted: encryptedTokens(tokens) },
      update: { encrypted: encryptedTokens(tokens) },
    })
  })
}

export async function accessToken() {
  return prisma.$transaction(
    async (tx) => {
      // Serializes refreshes across Railway replicas; refresh tokens rotate on every use.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(718421)`
      const row = await tx.integrationCredential.findUnique({
        where: { provider },
      })
      if (!row) throw new Error('ML_NOT_CONNECTED')
      const saved = storedSchema.parse(unseal(row.encrypted, 'tokens'))
      if (saved.expiresAt > Date.now() + 60000) return saved.accessToken
      const tokens = await requestTokens({
        grant_type: 'refresh_token',
        refresh_token: saved.refreshToken,
      })
      await tx.integrationCredential.update({
        where: { provider },
        data: { encrypted: encryptedTokens(tokens) },
      })
      return tokens.access_token
    },
    { maxWait: 15000, timeout: 15000 }
  )
}

/** The host and path are owned by the integration, never by a pasted URL. */
export async function mercadoLivreGet(
  path: string,
  token: string
): Promise<Record<string, unknown> | null> {
  if (
    !/^\/(products|items)\/MLB\d+(?:\/(items|description|sale_price))?$/.test(
      path
    )
  )
    throw new Error('INVALID_ML_RESOURCE')
  const response = await fetch(`https://api.mercadolibre.com${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(7000),
  })
  if (!response.ok) return null
  return await response.json()
}
