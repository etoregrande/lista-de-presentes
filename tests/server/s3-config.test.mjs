import assert from 'node:assert/strict'
import { test } from 'node:test'
import { loadModule } from '../helpers/load-module.mjs'

test('S3 configuration is required only when an image operation uses S3', () => {
  const storage = loadModule('src/lib/s3.ts', {
    '@aws-sdk/client-s3': { S3Client: class {} },
  }, { process: { env: {} } })

  assert.equal(typeof storage.getS3Client, 'function')
  assert.throws(() => storage.getS3Client(), /BUCKET_KEY/)
})
