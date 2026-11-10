import { emptyDraft, priceInCents } from './extract'
import { accessToken, mercadoLivreGet } from '@/lib/mercadolivre/client'

const record = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {}
const string = (v: unknown, max: number) =>
  typeof v === 'string' ? v.slice(0, max) : ''

export function mercadoLivreIds(link: string) {
  const url = new URL(link)
  if (
    url.hostname !== 'mercadolivre.com.br' &&
    !url.hostname.endsWith('.mercadolivre.com.br') &&
    url.hostname !== 'produto.mercadolivre.com.br'
  )
    return null
  const productId = url.pathname.match(/\/p\/(MLB\d+)/i)?.[1]?.toUpperCase()
  const wid =
    url.searchParams.get('wid') ||
    new URLSearchParams(url.hash.slice(1)).get('wid')
  const itemId =
    wid?.match(/^MLB\d+$/i)?.[0]?.toUpperCase() ||
    (!productId
      ? url.pathname
          .match(/MLB-?(\d+)/i)?.[0]
          ?.replace('-', '')
          .toUpperCase()
      : undefined)
  return productId || itemId ? { productId, itemId } : null
}

export async function importMercadoLivre(link: string) {
  const ids = mercadoLivreIds(link)
  if (!ids) return null
  const draft = emptyDraft(link)
  const token = await accessToken()
  const get = (path: string) => mercadoLivreGet(path, token).catch(() => null)
  const product = ids.productId ? await get(`/products/${ids.productId}`) : null
  if (product) {
    draft.name = string(product.name, 255)
    draft.description = string(record(product.short_description).content, 5000)
    const pictures = Array.isArray(product.pictures) ? product.pictures : []
    draft.imageUrl = string(record(pictures[0]).url, 4096) || null
  }
  const winner = record(product?.buy_box_winner)
  const winnerId = string(winner.item_id, 100)
  const itemId =
    ids.itemId || (/^MLB\d+$/.test(winnerId) ? winnerId : undefined)
  if (itemId) {
    const [item, price, description] = await Promise.all([
      get(`/items/${itemId}`),
      get(`/items/${itemId}/sale_price`),
      get(`/items/${itemId}/description`),
    ])
    // Never combine a seller's offer with a different catalogue product.
    if (item && ids.productId && item.catalog_product_id !== ids.productId)
      return draft
    draft.name = string(item?.title, 255) || draft.name
    const pictures = Array.isArray(item?.pictures) ? item.pictures : []
    draft.imageUrl =
      string(record(pictures[0]).secure_url || record(pictures[0]).url, 4096) ||
      draft.imageUrl
    draft.description =
      string(description?.plain_text, 5000) || draft.description
    draft.price =
      priceInCents(price?.amount, price?.currency_id) ??
      priceInCents(item?.price, item?.currency_id)
  }
  if (!ids.itemId && draft.price === null)
    draft.price = priceInCents(winner.price, winner.currency_id)
  return draft
}
