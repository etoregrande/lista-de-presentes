import assert from 'node:assert/strict'
import { test } from 'node:test'
import ipaddr from 'ipaddr.js'
import * as dns from 'node:dns/promises'
import * as http from 'node:http'
import * as https from 'node:https'
import { loadModule } from '../helpers/load-module.mjs'
import { EventEmitter } from 'node:events'

const { normalizeProductUrl, isPublicAddress } = loadModule(
  'src/lib/product-import/http.ts',
  {
    'ipaddr.js': ipaddr,
    'node:dns/promises': dns,
    'node:http': http,
    'node:https': https,
  },
  { AbortSignal }
)

test('import refuses internal IP ranges, mapped IPv6, credentials and unsafe protocols', () => {
  for (const address of [
    '127.0.0.1',
    '10.0.0.1',
    '169.254.169.254',
    '192.168.1.2',
    '100.64.0.1',
    '::1',
    '::ffff:127.0.0.1',
    'fc00::1',
    'fe80::1',
  ]) {
    assert.equal(isPublicAddress(address), false, address)
  }
  assert.equal(isPublicAddress('8.8.8.8'), true)
  for (const url of [
    'file:///etc/passwd',
    'https://user:password@example.com',
    'https://example.com:9000',
    'http://localhost',
    'http://127.1',
    'http://[::1]',
  ]) {
    assert.throws(() => normalizeProductUrl(url), url)
  }
  assert.equal(
    normalizeProductUrl('example.com/product').hostname,
    'example.com'
  )
})

function networkFixture(
  pages,
  addresses = [{ address: '8.8.8.8', family: 4 }]
) {
  const requested = []
  const pinned = []
  const request = (url, options, receive) => {
    const req = new EventEmitter()
    req.end = () => {
      options.lookup(url.hostname, {}, (error, address) => {
        if (error) {
          req.emit('error', error)
          return
        }
        pinned.push(address)
        requested.push(url.href)
        const page = pages.shift()
        const res = new EventEmitter()
        res.statusCode = page.status ?? 200
        res.headers = page.headers ?? { 'content-type': 'text/html' }
        res.destroy = (error) => {
          if (error) res.emit('error', error)
        }
        receive(res)
        res.emit('data', Buffer.from(page.body ?? 'page'))
        res.emit('end')
      })
    }
    return req
  }
  const { fetchPublicPage } = loadModule(
    'src/lib/product-import/http.ts',
    {
      'ipaddr.js': ipaddr,
      'node:dns/promises': { lookup: async () => addresses },
      'node:http': { request },
      'node:https': { request },
    },
    { AbortSignal }
  )
  return { fetchPublicPage, requested, pinned }
}

test('public DNS is pinned to the socket and a redirect to private IP is rejected before connecting', async () => {
  const f = networkFixture([
    {
      status: 302,
      headers: { location: 'http://169.254.169.254/latest/meta-data/' },
    },
  ])
  await assert.rejects(
    f.fetchPublicPage('https://example.com/product'),
    /INVALID_URL/
  )
  assert.deepEqual(f.requested, ['https://example.com/product'])
  assert.deepEqual(f.pinned, ['8.8.8.8'])
})

test('a hostname resolving to a private address never gets a request', async () => {
  const f = networkFixture([], [{ address: '127.0.0.1', family: 4 }])
  await assert.rejects(
    f.fetchPublicPage('https://example.com/product'),
    /PRIVATE_ADDRESS/
  )
  assert.deepEqual(f.requested, [])
})

test('body size is bounded even without Content-Length', async () => {
  const f = networkFixture([{ body: 'response exceeds bound' }])
  await assert.rejects(
    f.fetchPublicPage('https://example.com', { maxBytes: 4 }),
    /RESPONSE_TOO_LARGE/
  )
})
