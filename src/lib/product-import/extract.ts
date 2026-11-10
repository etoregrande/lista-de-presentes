import { load } from 'cheerio'

export interface ProductDraft {
  name: string
  description: string
  price: number | null
  imageUrl: string | null
  link: string
}

export function emptyDraft(link: string): ProductDraft {
  return { name: '', description: '', price: null, imageUrl: null, link }
}

export function priceInCents(value: unknown, currency: unknown): number | null {
  if (
    currency !== 'BRL' ||
    (typeof value !== 'string' && typeof value !== 'number')
  )
    return null
  const raw = String(value).replace(/R\$|\s/g, '')
  if (!/^\d+(?:[.,]\d+)*$/.test(raw)) return null
  const amount = Number(
    raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw
  )
  const cents = Math.round(amount * 100)
  return Number.isSafeInteger(cents) && cents >= 0 && cents <= 2_147_483_647
    ? cents
    : null
}

export function extractProduct(html: string, link: string): ProductDraft {
  const $ = load(html)
  $('script:not([type="application/ld+json"]), style, noscript').remove()
  const result = emptyDraft(link)
  const text = (value: unknown, max: number) =>
    typeof value === 'string'
      ? load(`<div>${value}</div>`)
          .root()
          .text()
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, max)
      : ''
  const meta = (name: string) =>
    $(`meta[property="${name}"],meta[name="${name}"]`).first().attr('content')
  const host = new URL(link).hostname

  if (host === 'amazon.com.br' || host.endsWith('.amazon.com.br')) {
    result.name = text($('#productTitle').text(), 255)
    // Do not import a CAPTCHA, login page, or unrelated recommendation as a product.
    if (!result.name) return result
    result.description = $('#feature-bullets li')
      .map((_, el) => text($(el).text(), 1000))
      .get()
      .filter(Boolean)
      .join('\n')
      .slice(0, 5000)
    result.imageUrl =
      $('#landingImage').attr('data-old-hires') ||
      $('#landingImage').attr('src') ||
      null
    const price = $(
      '#corePrice_feature_div .a-price .a-offscreen, #corePriceDisplay_desktop_feature_div .priceToPay .a-offscreen'
    )
      .first()
      .text()
    result.price = priceInCents(price, price.includes('R$') ? 'BRL' : '')
    return result
  }

  if (
    (host === 'mercadolivre.com.br' || host.endsWith('.mercadolivre.com.br')) &&
    /account-verification|\/login|\/registration/.test(new URL(link).pathname)
  )
    return result

  // Only traverse graphs, not recommendation lists that may contain other products.
  const products: Record<string, unknown>[] = []
  function collect(value: unknown) {
    if (Array.isArray(value)) {
      value.forEach(collect)
      return
    }
    if (!value || typeof value !== 'object') return
    const obj = value as Record<string, unknown>
    const types = Array.isArray(obj['@type']) ? obj['@type'] : [obj['@type']]
    if (types.includes('Product')) products.push(obj)
    if (obj['@graph']) collect(obj['@graph'])
  }
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      collect(JSON.parse($(el).text()))
    } catch {
      /* A malformed block need not invalidate metadata. */
    }
  })
  const product =
    products.length === 1 ? products[0] : products.find((p) => p.url === link)
  if (product) {
    result.name = text(product.name, 255)
    result.description = text(product.description, 5000)
    const image = Array.isArray(product.image)
      ? product.image[0]
      : product.image
    result.imageUrl =
      typeof image === 'string'
        ? image
        : image && typeof image === 'object' && 'url' in image
          ? String(image.url)
          : null
    const offers = Array.isArray(product.offers)
      ? product.offers
      : [product.offers]
    // A range or several sellers/variants is not an unambiguous current price.
    if (
      offers.length === 1 &&
      offers[0] &&
      offers[0]['@type'] !== 'AggregateOffer'
    ) {
      result.price = priceInCents(offers[0].price, offers[0].priceCurrency)
    }
  }
  result.name ||= text(meta('og:title') || $('title').text(), 255)
  result.description ||= text(
    meta('og:description') || meta('description'),
    5000
  )
  result.imageUrl ||= meta('og:image') || null
  if (!product)
    result.price = priceInCents(
      meta('product:price:amount'),
      meta('product:price:currency')
    )
  if (
    /captcha|access denied|robot check|verifique sua identidade|just a moment/i.test(
      result.name
    )
  )
    return emptyDraft(link)
  if (result.imageUrl) {
    try {
      result.imageUrl = new URL(result.imageUrl, link).href
    } catch {
      result.imageUrl = null
    }
  }
  return result
}
