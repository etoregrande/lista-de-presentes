import { s3 } from '@/lib/s3'
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { validateImageContent } from '@/lib/validated-image'

export const uploadImageToS3 = async (
  file: File,
  type: 'wishlist image' | 'user avatar' | 'group avatar',
  ownerId: string
): Promise<string> => {
  const { body, contentType } = await validateImageContent(file).catch(
    (cause: unknown) => {
      throw Object.assign(new Error('Image validation failed', { cause }), {
        name: 'ImageValidationError',
      })
    }
  )

  const s3KeyTemplates = {
    'wishlist image': (ownerId: string) =>
      `wishlist-images/${ownerId}/${Date.now()}`,
    'user avatar': (ownerId: string) => `user-avatars/${ownerId}/avatar.jpg`,
    'group avatar': (ownerId: string) => `group-avatars/${ownerId}/avatar.jpg`,
  } as const

  const key = s3KeyTemplates[type](ownerId)

  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  })

  try {
    await s3.send(command)
  } catch (cause) {
    throw Object.assign(new Error('Image upload failed', { cause }), {
      name: 'ImageUploadError',
    })
  }

  return `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${key}`
}

export const deleteImageFromS3 = async (imageUrl: string) => {
  const imageKey = new URL(imageUrl).pathname.slice(1)

  const command = new DeleteObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: imageKey,
  })

  await s3.send(command)
}
