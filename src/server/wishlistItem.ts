'use server'

import { type WishlistItemFormData } from '@/types/wishlistItem'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from '@/lib/s3'
import { prisma } from '@/lib/prisma'
import { sanitizeLinkUrl } from '@/lib/utils'
import { deleteImageFromS3, uploadImageToS3 } from './s3'
import { Priority, WishlistItem } from '@/generated/prisma'

export const createWishlistItem = async (
  formData: WishlistItemFormData,
  userId: string
) => {
  const { name, isActive, link, priority, description, image, price } = formData
  const sanitizedLink = sanitizeLinkUrl(link)
  let imageUrl: string | null = null

  if (image) {
    try {
      imageUrl = await uploadImageToS3(image, 'wishlist image', userId)
    } catch (error) {
      console.error('Error uploading image to S3 =>', error)
      throw new Error('Error handling image on S3')
    }
  }

  try {
    const newWishlistItem = await prisma.wishlistItem.create({
      data: {
        name,
        price: price ?? null,
        description: description ?? undefined,
        link: sanitizedLink ?? undefined,
        priority: (priority as Priority) ?? 'normal',
        isActive: isActive,
        image: imageUrl ?? null,
        userId: userId,
      },
    })

    if (!newWishlistItem) {
      console.error('Error creating wishlist item')
      return null
    }

    return newWishlistItem
  } catch (error) {
    console.error('Error creating wishlist item =>', error)
    return null
  }
}

export const updateWishlistItem = async (
  formData: WishlistItemFormData,
  wishlistItemId: string,
  userId: string
) => {
  const { name, description, price, link, image, priority, isActive } = formData
  const sanitizedLink = sanitizeLinkUrl(link)
  let imageUrl: string | null = null

  if (image) {
    try {
      imageUrl = await uploadImageToS3(image, 'wishlist image', userId)

      const existingItem = await prisma.wishlistItem.findUnique({
        select: { image: true },
        where: { id: wishlistItemId, userId },
      })

      if (existingItem?.image) {
        await deleteImageFromS3(existingItem.image)
      }
    } catch (error) {
      console.error('Error uploading image to S3 =>', error)
      throw new Error('Error handling images on S3')
    }
  }

  try {
    const editedWishlistItem = await prisma.wishlistItem.update({
      where: { id: wishlistItemId, userId },
      data: {
        name,
        price: price ?? null,
        description: description ?? null,
        link: sanitizedLink ?? null,
        priority: (priority as Priority) ?? 'normal',
        isActive: isActive,
        image: imageUrl ?? null,
      },
    })

    if (!editedWishlistItem) {
      throw new Error('Error editing wishlist item')
    }

    return editedWishlistItem
  } catch (error) {
    console.error('Error creating wishlist item =>', error)
    return null
  }
}

export const deleteWishlistItem = async (wishlistItemId: string) => {
  try {
    const deletedWishlistItem = await prisma.wishlistItem.delete({
      where: { id: wishlistItemId },
      select: { image: true },
    })

    if (!deletedWishlistItem) {
      throw new Error('Error deleting wishlist item')
    }
    if (deletedWishlistItem.image) {
      const imageKey = new URL(deletedWishlistItem.image).pathname.slice(1)
      const deleteParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: imageKey,
      }
      await s3.send(new DeleteObjectCommand(deleteParams))
    }
    return
  } catch (error) {
    console.error('Error deleting wishlist item =>', error)
    return null
  }
}

export const listWishlistItems = async (SessionUserId?: string) => {
  let userId

  if (!SessionUserId) {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      throw new Error('Unable to get session')
    }

    userId = session.user.id
  } else {
    userId = SessionUserId
  }

  try {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
    })

    return wishlistItems
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch Wishlist items.')
  }
}

export const purchaseWishlistItem = async (
  wishlistItem: Partial<WishlistItem>
) => {
  const { id, isPurchased } = wishlistItem

  if (!id || isPurchased === undefined) {
    throw new Error('Wishlist item ID and isPurchased status are required')
  }

  try {
    const updatedWishlistItem = await prisma.wishlistItem.update({
      where: { id },
      data: {
        isPurchased: !isPurchased,
        purchasedAt: !isPurchased ? new Date() : null,
      },
    })

    return updatedWishlistItem
  } catch (error) {
    console.error('Error patching wishlist item =>', error)
  }
}
