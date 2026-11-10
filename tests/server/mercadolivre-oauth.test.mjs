import assert from 'node:assert/strict'
import { test, mock } from 'node:test'
import * as crypto from 'node:crypto'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server.js'
import { loadModule } from '../helpers/load-module.mjs'

function fixture() {
  const env = {
    MERCADOLIVRE_CLIENT_ID: '123',
    MERCADOLIVRE_CLIENT_SECRET: 'secret',
    MERCADOLIVRE_REDIRECT_URI:
      'https://presenteio.app/api/integrations/mercadolivre/callback',
    MERCADOLIVRE_ADMIN_EMAIL: 'owner@example.com',
    MERCADOLIVRE_TOKEN_SECRET: 'x'.repeat(64),
  }
  const globals = { process: { env }, URLSearchParams, AbortSignal }
  const secrets = loadModule(
    'src/lib/mercadolivre/crypto.ts',
    { 'node:crypto': crypto },
    globals
  )
  const fetch = mock.fn(async () => ({
    ok: true,
    json: async () => ({
      access_token: 'access',
      refresh_token: 'refresh',
      expires_in: 21600,
    }),
  }))
  const oauth = loadModule(
    'src/lib/mercadolivre/oauth.ts',
    { 'node:crypto': crypto, zod: { z }, './crypto': secrets },
    { ...globals, fetch }
  )
  return { env, secrets, oauth, fetch, globals }
}

test('OAuth binds encrypted state to the signed-in user, expiry and PKCE verifier', () => {
  const f = fixture()
  const { url, cookie } = f.oauth.beginAuthorization('owner')
  const params = new URL(url).searchParams
  const verifier = f.oauth.verifyAuthorization(
    cookie,
    params.get('state'),
    'owner'
  )
  assert.equal(params.get('code_challenge_method'), 'S256')
  assert.equal(
    params.get('code_challenge'),
    crypto.createHash('sha256').update(verifier).digest('base64url')
  )
  assert.throws(() =>
    f.oauth.verifyAuthorization(cookie, params.get('state'), 'attacker')
  )
  assert.throws(() => f.oauth.verifyAuthorization(cookie, 'incorrect', 'owner'))
  const expired = f.secrets.seal(
    { state: 'state', verifier, userId: 'owner', expiresAt: 0 },
    'oauth'
  )
  assert.throws(() => f.oauth.verifyAuthorization(expired, 'state', 'owner'))
})

test('tokens are encrypted and cannot be used as an OAuth cookie or tampered with', () => {
  const f = fixture()
  const secret = f.secrets.seal({ accessToken: 'private-token' }, 'tokens')
  assert.equal(secret.includes('private-token'), false)
  assert.equal(f.secrets.unseal(secret, 'tokens').accessToken, 'private-token')
  assert.throws(() => f.secrets.unseal(secret, 'oauth'))
  const bytes = Buffer.from(secret, 'base64url')
  bytes[bytes.length - 1] ^= 1
  assert.throws(() => f.secrets.unseal(bytes.toString('base64url'), 'tokens'))
})

test('integration admin is an explicit server-side email allowlist', () => {
  const f = fixture()
  assert.equal(f.oauth.isIntegrationAdmin('OWNER@example.com'), true)
  assert.equal(f.oauth.isIntegrationAdmin('other@example.com'), false)
  delete f.env.MERCADOLIVRE_ADMIN_EMAIL
  assert.equal(f.oauth.isIntegrationAdmin('owner@example.com'), false)
})

test('authorization exchange sends the verifier only to the official token endpoint', async () => {
  const f = fixture()
  await f.oauth.requestTokens({
    grant_type: 'authorization_code',
    code: 'code',
    code_verifier: 'verifier',
    redirect_uri: f.env.MERCADOLIVRE_REDIRECT_URI,
  })
  const [url, options] = f.fetch.mock.calls[0].arguments
  assert.equal(url, 'https://api.mercadolibre.com/oauth/token')
  assert.equal(options.redirect, 'error')
  assert.equal(options.body.get('code_verifier'), 'verifier')
  assert.equal(options.body.get('client_secret'), 'secret')
})

test('expired credentials rotate and persist both tokens under a transaction lock', async () => {
  const f = fixture()
  let saved = {
    encrypted: f.secrets.seal(
      { accessToken: 'old', refreshToken: 'old-refresh', expiresAt: 0 },
      'tokens'
    ),
  }
  const lock = mock.fn(async () => 1)
  const update = mock.fn(async ({ data }) => {
    saved = data
  })
  const client = loadModule('src/lib/mercadolivre/client.ts', {
    zod: { z },
    './crypto': f.secrets,
    './oauth': f.oauth,
    '@/lib/prisma': {
      prisma: {
        $transaction: async (fn) =>
          fn({
            $executeRaw: lock,
            integrationCredential: { findUnique: async () => saved, update },
          }),
      },
    },
  })
  assert.equal(await client.accessToken(), 'access')
  assert.equal(
    f.fetch.mock.calls[0].arguments[1].body.get('refresh_token'),
    'old-refresh'
  )
  assert.equal(
    f.secrets.unseal(saved.encrypted, 'tokens').refreshToken,
    'refresh'
  )
  assert.equal(await client.accessToken(), 'access')
  assert.equal(f.fetch.mock.callCount(), 1)
  assert.equal(lock.mock.callCount(), 2)
})

test('callback never exchanges or stores credentials for a forged state or a different account', async () => {
  const f = fixture()
  let session = { user: { id: 'owner', email: 'owner@example.com' } }
  const storeTokens = mock.fn(async () => {})
  const { GET } = loadModule(
    'src/app/api/integrations/mercadolivre/callback/route.ts',
    {
      'next/server': { NextResponse },
      '@/server/session': { getSessionOnServer: async () => session },
      '@/lib/mercadolivre/oauth': f.oauth,
      '@/lib/mercadolivre/client': { storeTokens },
    },
    f.globals
  )
  const attempt = f.oauth.beginAuthorization('owner')
  const state = new URL(attempt.url).searchParams.get('state')
  const request = (value) =>
    new NextRequest(
      `${f.env.MERCADOLIVRE_REDIRECT_URI}?state=${value}&code=example-code`,
      {
        headers: { cookie: `${f.oauth.OAUTH_COOKIE}=${attempt.cookie}` },
      }
    )
  const rejected = await GET(request('forged'))
  assert.match(rejected.headers.get('location'), /mercadolivre=error/)
  assert.match(rejected.headers.get('set-cookie'), /Max-Age=0/)
  session = { user: { id: 'attacker', email: 'other@example.com' } }
  await GET(request(state))
  assert.equal(f.fetch.mock.callCount(), 0)
  assert.equal(storeTokens.mock.callCount(), 0)
  session = { user: { id: 'owner', email: 'owner@example.com' } }
  const accepted = await GET(request(state))
  assert.match(accepted.headers.get('location'), /mercadolivre=connected/)
  assert.equal(storeTokens.mock.callCount(), 1)
  assert.equal(accepted.headers.get('referrer-policy'), 'no-referrer')
})
