import assert from 'node:assert/strict'
import { after, test, mock } from 'node:test'
import * as crypto from 'node:crypto'
import { z } from 'zod'
import { PrismaPg } from '@prisma/adapter-pg'
import prismaExports from '../../src/generated/prisma/index.js'
import { loadModule } from '../helpers/load-module.mjs'

const url = process.env.TEST_DATABASE_URL
assert.ok(url)
assert.equal(new URL(url).pathname, '/presenteio_test')
assert.match(new URL(url).searchParams.get('host'), /presenteio-pg-test-/)
const prisma = new prismaExports.PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
})
after(() => prisma.$disconnect())
const secrets = loadModule(
  'src/lib/mercadolivre/crypto.ts',
  { 'node:crypto': crypto },
  {
    process: {
      env: { MERCADOLIVRE_TOKEN_SECRET: 'integration-only-secret'.repeat(3) },
    },
  }
)
const requestTokens = mock.fn(async () => ({
  access_token: 'new-access',
  refresh_token: 'new-refresh',
  expires_in: 21600,
}))
const client = loadModule('src/lib/mercadolivre/client.ts', {
  zod: { z },
  './crypto': secrets,
  './oauth': { requestTokens },
  '@/lib/prisma': { prisma },
})

test('database migration and advisory lock serialize simultaneous rotating-token refreshes', async () => {
  await prisma.integrationCredential.create({
    data: {
      provider: 'mercadolivre',
      encrypted: secrets.seal(
        {
          accessToken: 'old-access',
          refreshToken: 'old-refresh',
          expiresAt: 0,
        },
        'tokens'
      ),
    },
  })
  const results = await Promise.all([
    client.accessToken(),
    client.accessToken(),
    client.accessToken(),
  ])
  assert.equal(
    results.every((token) => token === 'new-access'),
    true
  )
  assert.equal(requestTokens.mock.callCount(), 1)
  const row = await prisma.integrationCredential.findUnique({
    where: { provider: 'mercadolivre' },
  })
  assert.equal(
    secrets.unseal(row.encrypted, 'tokens').refreshToken,
    'new-refresh'
  )
  await client.storeTokens({
    access_token: 'reconnected',
    refresh_token: 'reconnected-refresh',
    expires_in: 21600,
  })
  assert.equal(await client.accessToken(), 'reconnected')
})
