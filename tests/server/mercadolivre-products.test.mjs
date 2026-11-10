import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as cheerio from 'cheerio'
import { loadModule } from '../helpers/load-module.mjs'

const extraction = loadModule('src/lib/product-import/extract.ts', { cheerio })
function fixture(responses) {
  return loadModule(
    'src/lib/product-import/mercadolivre.ts',
    {
      './extract': extraction,
      '@/lib/mercadolivre/client': {
        accessToken: async () => 'test-token',
        mercadoLivreGet: async (path) => responses[path] ?? null,
      },
    },
    { URLSearchParams }
  )
}

test('Mercado Livre uses the selected offer and the current sale-price endpoint', async () => {
  const f = fixture({
    '/products/MLB123': {
      name: 'TV',
      pictures: [{ url: 'https://example.com/tv.jpg' }],
    },
    '/items/MLB456': {
      title: 'TV 32',
      catalog_product_id: 'MLB123',
      price: 999,
      currency_id: 'BRL',
    },
    '/items/MLB456/sale_price': { amount: 799.9, currency_id: 'BRL' },
    '/items/MLB456/description': { plain_text: 'TV com Wi-Fi' },
  })
  const product = await f.importMercadoLivre(
    'https://www.mercadolivre.com.br/tv/p/MLB123#wid=MLB456'
  )
  assert.equal(product.name, 'TV 32')
  assert.equal(product.price, 79990)
  assert.equal(product.description, 'TV com Wi-Fi')
})

test('restricted offer access preserves catalogue fields without inventing a price', async () => {
  const f = fixture({
    '/products/MLB123': {
      name: 'TV',
      pictures: [{ url: 'https://example.com/tv.jpg' }],
    },
  })
  const product = await f.importMercadoLivre(
    'https://www.mercadolivre.com.br/tv/p/MLB123'
  )
  assert.equal(product.name, 'TV')
  assert.equal(product.price, null)
  assert.equal(
    f.mercadoLivreIds('https://mercadolivre.com.br.attacker.com/p/MLB123'),
    null
  )
})

test('a mismatched selected offer cannot overwrite catalogue product details', async () => {
  const f = fixture({
    '/products/MLB123': { name: 'TV' },
    '/items/MLB456': {
      title: 'Other product',
      catalog_product_id: 'MLB999',
      price: 50,
      currency_id: 'BRL',
    },
  })
  const product = await f.importMercadoLivre(
    'https://www.mercadolivre.com.br/tv/p/MLB123#wid=MLB456'
  )
  assert.equal(product.name, 'TV')
  assert.equal(product.price, null)
})
