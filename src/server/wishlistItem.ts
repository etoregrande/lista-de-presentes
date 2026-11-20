'use server'

import { type WishlistItemFormData } from '@/types/wishlistItem'
import { prisma } from '@/lib/prisma'
import { wishlistItemFormSchema } from '@/schemas/wishlistItem'
import { identifierSchema, priceInCentsSchema } from '@/schemas/common'
import { z } from 'zod'
import { deleteImageFromS3, uploadImageToS3 } from './s3'
import { WishlistItem } from '@/generated/prisma'
import { requireAuthenticatedUserId } from './session'

async function removeFailedUpload(imageUrl: string | null) {
  if (!imageUrl) return
  try {
    await deleteImageFromS3(imageUrl)
  } catch (error) {
    console.error('Error cleaning up new wishlist image =>', error)
  }
}

export const createWishlistItem = async (formData: WishlistItemFormData) => {
  const userId = await requireAuthenticatedUserId()
  const { name, isActive, link, priority, description, image, price } =
    wishlistItemFormSchema.parse(formData)
  let imageUrl: string | null = null

  if (image) {
    try {
      imageUrl = await uploadImageToS3(image, 'wishlist image', userId)
    } catch (error) {
      console.error('Error uploading image to S3 =>', error)
      throw error
    }
  }

  try {
    const newWishlistItem = await prisma.wishlistItem.create({
      data: {
        name,
        price: price ?? null,
        description: description ?? undefined,
        link: link || undefined,
        priority: priority ?? 'normal',
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
    await removeFailedUpload(imageUrl)
    return null
  }
}

export const updateWishlistItem = async (
  formData: WishlistItemFormData,
  wishlistItemId: string
) => {
  const userId = await requireAuthenticatedUserId()
  wishlistItemId = identifierSchema.parse(wishlistItemId)
  const existingItem = await prisma.wishlistItem.findUnique({
    select: { image: true },
    where: { id: wishlistItemId, userId },
  })
  if (!existingItem) throw new Error('Wishlist item not found')

  const { name, description, price, link, image, priority, isActive } =
    wishlistItemFormSchema.parse(formData)
  let imageUrl: string | null = null

  if (image) {
    try {
      imageUrl = await uploadImageToS3(image, 'wishlist image', userId)
    } catch (error) {
      console.error('Error uploading image to S3 =>', error)
      throw error
    }
  }

  try {
    const dataToUpdate: Partial<WishlistItem> = {
      name,
      price: price ?? null,
      description: description ?? null,
      link: link || null,
      priority: priority ?? 'normal',
    }

    if (imageUrl) {
      dataToUpdate.image = imageUrl
    }
    if (typeof isActive === 'boolean') {
      dataToUpdate.isActive = isActive
    }

    const editedWishlistItem = await prisma.wishlistItem.update({
      where: { id: wishlistItemId, userId },
      data: dataToUpdate,
    })

    if (!editedWishlistItem) {
      throw new Error('Error editing wishlist item')
    }

    if (imageUrl && existingItem.image) {
      try {
        await deleteImageFromS3(existingItem.image)
      } catch (error) {
        console.error('Error deleting previous wishlist image =>', error)
      }
    }

    return editedWishlistItem
  } catch (error) {
    await removeFailedUpload(imageUrl)
    console.error('Error updating wishlist item =>', error)
    return null
  }
}

export const deleteWishlistItem = async (wishlistItemId: string) => {
  const userId = await requireAuthenticatedUserId()
  wishlistItemId = identifierSchema.parse(wishlistItemId)
  let imageUrl: string | null
  try {
    const deletedWishlistItem = await prisma.wishlistItem.delete({
      where: { id: wishlistItemId, userId },
      select: { image: true },
    })
    imageUrl = deletedWishlistItem.image
  } catch (error) {
    console.error('Error deleting wishlist item =>', error)
    return null
  }

  if (imageUrl) {
    try {
      await deleteImageFromS3(imageUrl)
    } catch (error) {
      console.error('Error deleting wishlist image =>', error)
    }
  }
}

type WishlistFilters = { maxPrice?: number }

export const listWishlistItems = async (filters?: WishlistFilters) => {
  const userId = await requireAuthenticatedUserId()
  return findWishlistItems(userId, filters, false)
}

export const listPublicWishlistItems = async (
  userId: string,
  filters?: WishlistFilters
) => {
  userId = identifierSchema.parse(userId)
  return findWishlistItems(userId, filters, true)
}

async function findWishlistItems(
  userId: string,
  filters: WishlistFilters | undefined,
  publicOnly: boolean
) {
  const validatedFilters = z
    .object({ maxPrice: priceInCentsSchema.optional() })
    .parse(filters ?? {})
  try {
    return await prisma.wishlistItem.findMany({
      where: {
        userId,
        ...(publicOnly && { isActive: true }),
        ...(validatedFilters.maxPrice !== undefined && {
          price: { lte: validatedFilters.maxPrice },
        }),
      },
    })
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch Wishlist items.')
  }
}

export const purchaseWishlistItem = async (
  wishlistItem: Partial<WishlistItem>
) => {
  const { id, isPurchased } = z
    .object({
      id: identifierSchema,
      isPurchased: z.boolean(),
    })
    .parse(wishlistItem)

  try {
    const updatedWishlistItem = await prisma.wishlistItem.update({
      where: { id, isActive: true },
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

// Return expected image failures explicitly; production actions redact thrown errors.
async function withImageFeedback<T>(save: () => Promise<T>) {
  try {
    return await save()
  } catch (error) {
    if (error && typeof error === 'object' && 'name' in error) {
      if (error.name === 'ImageValidationError') {
        return {
          imageErrorCode: 'INVALID_IMAGE' as const,
          imageError:
            'Não foi possível processar a imagem. Use outro arquivo JPG, PNG ou WEBP válido de até 5 MB e 16 megapixels.',
        }
      }
      if (error.name === 'ImageUploadError') {
        return {
          imageErrorCode: 'IMAGE_UPLOAD_FAILED' as const,
          imageError:
            'Não foi possível enviar a imagem ao armazenamento. Aguarde um momento e tente novamente.',
        }
      }
    }
    throw error
  }
}

export async function createWishlistItemWithFeedback(
  formData: WishlistItemFormData
) {
  return withImageFeedback(() => createWishlistItem(formData))
}

export async function updateWishlistItemWithFeedback(
  formData: WishlistItemFormData,
  wishlistItemId: string
) {
  return withImageFeedback(() => updateWishlistItem(formData, wishlistItemId))
}
