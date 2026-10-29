import { z } from 'zod'

export const MAX_IMAGE_PIXELS = 16_000_000

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export const imageFileSchema = z
  .custom<File>(
    (value) => typeof File !== 'undefined' && value instanceof File,
    { message: 'Selecione um arquivo de imagem válido' }
  )
  .refine((file) => file.size > 0 && file.size <= MAX_IMAGE_BYTES, {
    message: 'A imagem deve ter conteúdo e no máximo 5MB',
  })
  .refine((file) => IMAGE_MIME_TYPES.some((type) => type === file.type), {
    message: 'Formato inválido. Use JPG, PNG ou WEBP',
  })

export const imageFileBrowserSchema = imageFileSchema.refine(
  async (file) => {
    if (!(file instanceof File) || !file.size || file.size > MAX_IMAGE_BYTES)
      return false
    try {
      const bitmap = await createImageBitmap(file)
      try {
        return bitmap.width * bitmap.height <= MAX_IMAGE_PIXELS
      } finally {
        bitmap.close()
      }
    } catch {
      return false
    }
  },
  {
    message:
      'Imagem inválida ou grande demais. Use JPG, PNG ou WEBP de até 5 MB e 16 megapixels',
  }
)
