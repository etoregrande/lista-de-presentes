import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto'

function key() {
  const secret = process.env.MERCADOLIVRE_TOKEN_SECRET
  if (!secret || secret.length < 32) throw new Error('ML_NOT_CONFIGURED')
  return createHash('sha256').update(secret).digest()
}

export function seal(value: unknown, purpose: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(), iv)
  cipher.setAAD(Buffer.from(purpose))
  const data = Buffer.concat([
    cipher.update(JSON.stringify(value), 'utf8'),
    cipher.final(),
  ])
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64url')
}

export function unseal(value: string, purpose: string): unknown {
  const bytes = Buffer.from(value, 'base64url')
  const cipher = createDecipheriv('aes-256-gcm', key(), bytes.subarray(0, 12))
  cipher.setAAD(Buffer.from(purpose))
  cipher.setAuthTag(bytes.subarray(12, 28))
  return JSON.parse(
    Buffer.concat([cipher.update(bytes.subarray(28)), cipher.final()]).toString(
      'utf8'
    )
  )
}
