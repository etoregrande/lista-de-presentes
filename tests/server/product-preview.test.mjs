import assert from 'node:assert/strict'
import { test, mock } from 'node:test'
import * as cheerio from 'cheerio'
import sharp from 'sharp'
import { NextRequest, NextResponse } from 'next/server.js'
import { loadModule } from '../helpers/load-module.mjs'

const extraction = loadModule('src/lib/product-import/extract.ts', { cheerio })
const normalizeProductUrl = (value) => {
  const url = new URL(value)
  if (url.hostname === '127.0.0.1') throw new Error('PRIVATE_ADDRESS')
  return url
}

test('preview returns an editable draft and a decoded image, with no storage/database writes', async () => {
  const image = await sharp({
    create: { width: 4, height: 4, channels: 3, background: 'red' },
  })
    .png()
    .toBuffer()
  const fetchPublicPage = mock.fn(async (url) =>
    url.endsWith('.png')
      ? { contentType: 'image/png', body: image, url }
      : {
          contentType: 'text/html',
          body: Buffer.from(
            '<meta property="og:title" content="Caneca"><meta property="og:image" content="https://example.com/cup.png">'
          ),
          url,
        }
  )
  const { previewProduct } = loadModule('src/lib/product-import/preview.ts', {
    sharp,
    './http': { normalizeProductUrl, fetchPublicPage },
    './extract': extraction,
    './mercadolivre': { mercadoLivreIds: () => null },
  })
  const draft = await previewProduct('https://example.com/cup')
  assert.equal(draft.name, 'Caneca')
  assert.equal(draft.price, null)
  assert.equal(draft.image.type, 'image/webp')
  assert.equal(
    (await sharp(Buffer.from(draft.image.base64, 'base64')).metadata()).format,
    'webp'
  )
  assert.match(draft.message, /parte/)
  assert.equal(fetchPublicPage.mock.callCount(), 2)
})

test('store failures yield a blank draft retaining the link; corrupt image preserves other fields', async () => {
  for (const blocked of [true, false]) {
    const { previewProduct } = loadModule('src/lib/product-import/preview.ts', {
      sharp,
      './http': {
        normalizeProductUrl,
        fetchPublicPage: async (url) => {
          if (blocked) throw new Error('403')
          return {
            url,
            contentType: url.endsWith('.png') ? 'image/png' : 'text/html',
            body: Buffer.from(
              url.endsWith('.png')
                ? 'not a PNG'
                : '<meta property="og:title" content="Caneca"><meta property="og:image" content="/image.png">'
            ),
          }
        },
      },
      './extract': extraction,
      './mercadolivre': { mercadoLivreIds: () => null },
    })
    const result = await previewProduct('https://example.com/product')
    assert.equal(result.link, 'https://example.com/product')
    assert.equal(result.image, null)
    assert.equal(result.name, blocked ? '' : 'Caneca')
  }
})

test('preview route requires login, validates input and rate limits before extraction', async () => {
  let session = null
  let allowed = true
  const previewProduct = mock.fn(async (link) => ({
    ...extraction.emptyDraft(link),
    image: null,
  }))
  const release = mock.fn()
  const { POST } = loadModule('src/app/api/products/preview/route.ts', {
    'next/server': { NextResponse },
    '@/server/session': { getSessionOnServer: async () => session },
    '@/lib/product-import/preview': { previewProduct },
    '@/lib/product-import/http': { normalizeProductUrl },
    '@/lib/product-import/rate-limit': {
      acquireImportSlot: () => (allowed ? release : null),
    },
  })
  const request = (url, origin = 'https://presenteio.app') =>
    new NextRequest('https://presenteio.app/api/products/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', origin },
      body: JSON.stringify({ url }),
    })
  assert.equal((await POST(request('https://example.com'))).status, 401)
  session = { user: { id: 'owner' } }
  assert.equal((await POST(request('http://127.0.0.1'))).status, 400)
  assert.equal(
    (await POST(request('https://example.com', 'https://attacker.com'))).status,
    403
  )
  allowed = false
  assert.equal((await POST(request('https://example.com'))).status, 429)
  assert.equal(previewProduct.mock.callCount(), 0)
  allowed = true
  assert.equal((await POST(request('https://example.com'))).status, 200)
  assert.equal(previewProduct.mock.callCount(), 1)
  assert.equal(release.mock.callCount(), 2)
})
