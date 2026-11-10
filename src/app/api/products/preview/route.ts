import { NextRequest, NextResponse } from 'next/server'
import { getSessionOnServer } from '@/server/session'
import { previewProduct } from '@/lib/product-import/preview'
import { normalizeProductUrl } from '@/lib/product-import/http'
import { acquireImportSlot } from '@/lib/product-import/rate-limit'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const reply = (data: unknown, status = 200) =>
    NextResponse.json(data, {
      status,
      headers: { 'Cache-Control': 'no-store' },
    })
  const session = await getSessionOnServer()
  if (!session)
    return reply({ error: 'Entre na sua conta para buscar um produto.' }, 401)
  // JSON requests are same-origin; reject browser requests originating from another site.
  const origin = request.headers.get('origin')
  const expectedOrigin = new URL(process.env.BETTER_AUTH_URL || request.url)
    .origin
  if (origin && origin !== expectedOrigin)
    return reply({ error: 'Origem inválida.' }, 403)
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return reply({ error: 'Formato inválido.' }, 415)
  const release = acquireImportSlot(session.user.id)
  if (!release)
    return reply({ error: 'Aguarde um minuto antes de tentar novamente.' }, 429)
  try {
    // Read with a bound even when Content-Length is missing or dishonest.
    const reader = request.body?.getReader()
    if (!reader) return reply({ error: 'Informe o link do produto.' }, 400)
    const chunks: Uint8Array[] = []
    let size = 0
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 8192) {
        await reader.cancel()
        return reply({ error: 'Link muito longo.' }, 413)
      }
      chunks.push(value)
    }
    let url: string
    try {
      const input = JSON.parse(Buffer.concat(chunks).toString('utf8'))
      url = normalizeProductUrl(input.url).href
    } catch {
      return reply({ error: 'Informe um link válido de uma loja.' }, 400)
    }
    return reply(await previewProduct(url))
  } finally {
    release()
  }
}
