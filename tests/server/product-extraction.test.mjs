import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as cheerio from 'cheerio'
import { loadModule } from '../helpers/load-module.mjs'

const { extractProduct } = loadModule('src/lib/product-import/extract.ts', {
  cheerio,
})

test('Amazon extracts selected product and full price, ignoring recommendations and installments', () => {
  const result = extractProduct(
    `<html><span class="a-price"><span class="a-offscreen">R$12,00</span></span>
    <span id="productTitle">Airfryer 110V</span>
    <img id="landingImage" data-old-hires="https://m.media-amazon.com/test.jpg">
    <div id="corePrice_feature_div"><span class="a-price"><span class="a-offscreen">R$549,00</span></span></div>
    <div id="feature-bullets"><ul><li>Capacidade de 12 litros</li></ul></div></html>`,
    'https://www.amazon.com.br/dp/B0DD1KD5JP'
  )
  assert.equal(result.name, 'Airfryer 110V')
  assert.equal(result.price, 54900)
  assert.equal(result.imageUrl, 'https://m.media-amazon.com/test.jpg')
  assert.equal(result.description, 'Capacidade de 12 litros')
})

test('generic JSON-LD graph yields a product and resolves a relative image', () => {
  const html = `<script type="application/ld+json">{"@graph":[{"@type":"Organization","name":"Store"},{"@type":"Product","name":"Caneca","image":"/cup.jpg","description":"Uma <b>caneca</b>","offers":{"@type":"Offer","price":"129.90","priceCurrency":"BRL"}}]}</script>`
  const product = extractProduct(html, 'https://example.com/cup')
  assert.equal(product.name, 'Caneca')
  assert.equal(product.price, 12990)
  assert.equal(product.imageUrl, 'https://example.com/cup.jpg')
  assert.equal(product.description, 'Uma caneca')
})

test('unknown currency and ambiguous variant prices stay blank', () => {
  for (const offers of [
    { '@type': 'Offer', price: '99', priceCurrency: 'USD' },
    {
      '@type': 'AggregateOffer',
      lowPrice: '99',
      highPrice: '200',
      priceCurrency: 'BRL',
    },
    [
      { price: '99', priceCurrency: 'BRL' },
      { price: '200', priceCurrency: 'BRL' },
    ],
    { price: '-10', priceCurrency: 'BRL' },
  ]) {
    const html = `<script type="application/ld+json">${JSON.stringify({ '@type': 'Product', name: 'Product', offers })}</script>`
    assert.equal(
      extractProduct(html, 'https://example.com/product').price,
      null
    )
  }
})

test('malformed JSON-LD falls back to sharing metadata', () => {
  const html = `<script type="application/ld+json">invalid</script><meta property="og:title" content="Caneca &amp; Pires"><meta property="og:image" content="/image.jpg">`
  const product = extractProduct(html, 'https://example.com/product')
  assert.equal(product.name, 'Caneca & Pires')
  assert.equal(product.imageUrl, 'https://example.com/image.jpg')
})

test('marketplace login and challenge pages never become product names', () => {
  assert.equal(
    extractProduct(
      '<title>Amazon.com.br</title>Continuar comprando',
      'https://amazon.com.br/dp/B012345678'
    ).name,
    ''
  )
  assert.equal(
    extractProduct(
      '<title>Mercado Livre</title>',
      'https://www.mercadolivre.com.br/gz/account-verification'
    ).name,
    ''
  )
})
