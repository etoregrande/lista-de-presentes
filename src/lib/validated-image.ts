import sharp from 'sharp'
import {
  imageFileSchema,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_PIXELS,
} from '@/schemas/image'

export { MAX_IMAGE_PIXELS } from '@/schemas/image'

/** Decode and re-encode uploads so corrupt files and non-image payloads never reach S3. */
export async function validateImageContent(file: File) {
  imageFileSchema.parse(file)
  const buffer = Buffer.from(await file.arrayBuffer())
  if (buffer.length !== file.size || buffer.length > MAX_IMAGE_BYTES) {
    throw new Error('Invalid image size')
  }

  try {
    const hasSupportedHeader =
      (file.type === 'image/jpeg' &&
        buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) ||
      (file.type === 'image/png' &&
        buffer
          .subarray(0, 8)
          .equals(
            Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
          )) ||
      (file.type === 'image/webp' &&
        buffer.toString('ascii', 0, 4) === 'RIFF' &&
        buffer.toString('ascii', 8, 12) === 'WEBP')
    if (!hasSupportedHeader) throw new Error('Invalid image format')

    const image = sharp(buffer, {
      failOn: 'warning',
      limitInputPixels: MAX_IMAGE_PIXELS,
      animated: true,
    })
    const metadata = await image.metadata()
    const contentTypes: Record<string, string> = {
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    }
    const contentType = metadata.format && contentTypes[metadata.format]
    if (!contentType || contentType !== file.type) {
      throw new Error('Invalid image format')
    }
    if (!metadata.pages || metadata.pages === 1) image.rotate()
    const body = await image.toBuffer()
    if (body.length > MAX_IMAGE_BYTES) throw new Error('Image is too large')
    return { body, contentType }
  } catch (cause) {
    throw new Error(
      'Imagem inválida, corrompida ou grande demais. Use JPG, PNG ou WEBP de até 16 megapixels',
      { cause }
    )
  }
}
