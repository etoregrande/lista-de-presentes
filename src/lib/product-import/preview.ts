import sharp from 'sharp'
import { fetchPublicPage, normalizeProductUrl } from './http'
import { emptyDraft, extractProduct } from './extract'
import { importMercadoLivre, mercadoLivreIds } from './mercadolivre'

export interface ProductPreview {
  name: string
  description: string
  price: number | null
  link: string
  image: { base64: string; type: 'image/webp' } | null
  message: string
}

export async function previewProduct(input: string): Promise<ProductPreview> {
  const link = normalizeProductUrl(input).href
  let draft = emptyDraft(link)
  let image: ProductPreview['image'] = null
  if (mercadoLivreIds(link)) {
    try {
      draft = (await importMercadoLivre(link)) ?? draft
    } catch {
      /* HTML remains available as a fallback. */
    }
  }
  // A partially successful API response is useful; avoid replacing selected seller data.
  if (!draft.name) {
    try {
      const page = await fetchPublicPage(link)
      if (/text\/html|application\/xhtml\+xml/i.test(page.contentType)) {
        draft = extractProduct(page.body.toString('utf8'), page.url)
        // Short links can resolve to an ML catalogue URL, possibly behind verification.
        let resolved = new URL(page.url)
        if (
          resolved.hostname.endsWith('.mercadolivre.com.br') &&
          resolved.pathname === '/gz/account-verification'
        ) {
          try {
            resolved = normalizeProductUrl(
              resolved.searchParams.get('go') ?? ''
            )
          } catch {
            /* Keep verification URL. */
          }
        }
        if (
          !draft.name &&
          !mercadoLivreIds(link) &&
          mercadoLivreIds(resolved.href)
        ) {
          try {
            draft = (await importMercadoLivre(resolved.href)) ?? draft
          } catch {
            /* Manual entry remains available. */
          }
        }
      }
    } catch {
      /* Store blocks and timeouts must not block creating a wishlist item manually. */
    }
  }
  if (draft.imageUrl) {
    try {
      const downloaded = await fetchPublicPage(draft.imageUrl, {
        maxBytes: 5 * 1024 * 1024,
        timeoutMs: 6000,
      })
      if (!/^image\/(jpeg|png|webp)(;|$)/i.test(downloaded.contentType))
        throw new Error('INVALID_IMAGE')
      const decoder = sharp(downloaded.body, {
        limitInputPixels: 16_000_000,
        failOn: 'warning',
      })
      const metadata = await decoder.metadata()
      if (!['jpeg', 'png', 'webp'].includes(metadata.format ?? ''))
        throw new Error('INVALID_IMAGE')
      const body = await decoder
        .rotate()
        .resize({
          width: 1200,
          height: 1200,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer()
      if (body.length > 1024 * 1024) throw new Error('IMAGE_TOO_LARGE')
      image = { base64: body.toString('base64'), type: 'image/webp' }
    } catch {
      /* Keep the other fields when the image cannot be safely imported. */
    }
  }
  const complete = draft.name && draft.price !== null && image
  return {
    name: draft.name,
    description: draft.description,
    price: draft.price,
    link,
    image,
    message: complete
      ? 'Confira as informações antes de salvar. O preço pode mudar na loja.'
      : draft.name
        ? 'Encontramos parte das informações. Confira e complete o que faltar.'
        : 'Não conseguimos buscar as informações desta loja. Você pode preencher o item manualmente.',
  }
}
