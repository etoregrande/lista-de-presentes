import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadModule } from '../helpers/load-module.mjs'
import * as crypto from 'node:crypto'

test('S3 configuration is required only when an image operation uses S3', () => {
  const storage = loadModule('src/lib/s3.ts', {
    '@aws-sdk/client-s3': { S3Client: class {} },
  }, { process: { env: {} } })

  assert.equal(typeof storage.getS3Client, 'function')
  assert.throws(() => storage.getS3Client(), /BUCKET_KEY/)
})

test('simultaneous wishlist uploads receive different storage keys', async () => {
  const keys = []
  const storage = loadModule('src/server/s3.ts', {
    '@/lib/s3': { getS3Client: () => ({ send: async (command) => { keys.push(command.input.Key) } }) },
    '@/lib/validated-image': { validateImageContent: async () => ({ body: Buffer.from('image'), contentType: 'image/png' }) },
    '@aws-sdk/client-s3': {
      PutObjectCommand: class { constructor(input) { this.input = input } },
      DeleteObjectCommand: class {},
    },
    'node:crypto': crypto,
  }, { Date: { now: () => 123 } })

  await Promise.all([
    storage.uploadImageToS3({}, 'wishlist image', 'owner'),
    storage.uploadImageToS3({}, 'wishlist image', 'owner'),
  ])
  assert.equal(new Set(keys).size, 2)
})
