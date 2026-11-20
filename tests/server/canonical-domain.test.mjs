import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadModule } from '../helpers/load-module.mjs'

const config = loadModule('next.config.ts', { 'dotenv/config': {} }).default

test('old www links redirect permanently to the canonical host with their path', async () => {
  const redirects = await config.redirects?.()
  assert.ok(
    redirects?.some(
      (rule) =>
        rule.source === '/:path*' &&
        rule.destination === 'https://presenteio.app/:path*' &&
        rule.permanent === true &&
        rule.has?.some(
          (condition) =>
            condition.type === 'host' &&
            condition.value === 'www.presenteio.app'
        )
    ),
    'The old www host must land on the host that owns the login session'
  )
})
