import { s3 } from '@/lib/s3'
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

export const uploadWishlistImageToS3 = async (
  file: File,
  userId: string
): Promise<string> => {
  const imageBuffer = Buffer.from(await file.arrayBuffer())

  const key = `wishlist-images/${userId}/${Date.now()}`

  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    Body: imageBuffer,
    ContentType: file.type,
  })

  await s3.send(command)

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
