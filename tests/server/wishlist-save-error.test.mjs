import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadModule } from '../helpers/load-module.mjs'

const { getWishlistSaveError } = loadModule('src/lib/wishlist-save-error.ts', {})

test('unreadable device files tell the user to select the image again', () => {
  const result = getWishlistSaveError(new DOMException('private file path', 'NotReadableError'))
  assert.equal(result.code, 'IMAGE_NOT_READABLE')
  assert.match(result.message, /selecione.*imagem/i)
  assert.doesNotMatch(result.message, /private|sessão/)
})

test('server error digest is preserved without exposing the original message', () => {
  const result = getWishlistSaveError(Object.assign(new Error('secret database details'), { digest: '123456789' }))
  assert.equal(result.code, 'SERVER_123456789')
  assert.doesNotMatch(result.message, /secret|database|sessão/)
})

test('browser TypeError is identified without assuming a session or network failure', () => {
  const result = getWishlistSaveError(new TypeError('Failed to fetch'))
  assert.equal(result.code, 'CLIENT_TYPE_ERROR')
  assert.doesNotMatch(result.message, /sessão/)
})

test('unexpected errors and untrusted digests use a bounded generic code', () => {
  for (const error of [null, 'secret', { digest: '<secret>' }, new Error('secret')]) {
    assert.equal(getWishlistSaveError(error).code, 'SAVE_FAILED')
    assert.doesNotMatch(getWishlistSaveError(error).message, /secret/)
  }
})
