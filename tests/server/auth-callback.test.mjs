import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadModule } from '../helpers/load-module.mjs'

const callbacks = loadModule('src/lib/auth-callback.ts', {})
const { getSafeAuthCallbackPath } = callbacks

for (const [input, expected] of [
  ['/wishlist', '/wishlist'],
  ['/groups/holiday-Ab12_-/join', '/groups/holiday-Ab12_-/join'],
  [
    '/wishlist/shared/owner?priceLimit=123.45#gift',
    '/wishlist/shared/owner?priceLimit=123.45#gift',
  ],
  ['/groups/família/join', '/groups/fam%C3%ADlia/join'],
  ['/wishlist?label=50%25', '/wishlist?label=50%25'],
  [
    '/wishlist?next=https%3A%2F%2Fexample.test',
    '/wishlist?next=https%3A%2F%2Fexample.test',
  ],
  ['/a/../wishlist', '/wishlist'],
  ['/wishlist#section', '/wishlist#section'],
  ['/', '/'],
]) {
  test(`callback preserves safe path ${input}`, () => {
    assert.equal(getSafeAuthCallbackPath(input), expected)
  })
}

for (const input of [
  null,
  undefined,
  '',
  'wishlist',
  '?callback=/wishlist',
  '#wishlist',
  'https://example.test/wishlist',
  'http://example.test',
  '//example.test/path',
  '///example.test',
  'javascript:alert(1)',
  'JaVaScRiPt:alert(1)',
  'data:text/html,test',
  'file:///tmp/test',
  ' https://example.test',
  ' /groups/holiday/join',
  '/wishlist ',
  '/\\example.test',
  '\\example.test',
  '/\n/example.test',
  '/\t/example.test',
  '/\r/example.test',
  '/\u0000test',
  '/%2fexample.test',
  '/%2F%2Fexample.test',
  '/%5cexample.test',
  '/%255cexample.test',
  '/%252fexample.test',
  '/%00test',
  '/%0d%0a/example.test',
  '/a/..//example.test',
  '/a/../%2fexample.test',
  '/%2e%2e//example.test',
  '/bad%zz',
  '/bad%',
  '/%E0%A4%A',
  '/wishlist?bad=%zz',
  '/wishlist#bad=%zz',
]) {
  test(`callback rejects unsafe or malformed value ${JSON.stringify(input)}`, () => {
    assert.equal(getSafeAuthCallbackPath(input), '/wishlist')
  })
}
