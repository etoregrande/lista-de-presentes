'use server'

import 'dotenv/config'
import {
  EditWishlistItemFormDataType,
  type CreateWishlistItemFormDataType,
} from '@/types/wishlistItem'
import { db } from '@/lib/database/db'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from '@/lib/database/s3'
import { sql } from 'kysely'
import { sanitizeLinkUrl } from '@/lib/utils'
import { deleteImageFromS3, uploadImageToS3 } from './s3'
import { NewWishlistItem, UpdateWishlistItem, WishlistItem } from '@/types/db'

export const createWishlistItem = async (
  formData: CreateWishlistItemFormDataType,
  userId: string
): Promise<Partial<WishlistItem> | null> => {
  const { name, isActive, link, priority, description, image, price } = formData
  const sanitizedLink = sanitizeLinkUrl(link)
  let imageUrl: string | null = null
  const newImage = image?.[0]

  if (newImage) {
    try {
      imageUrl = await uploadImageToS3(newImage, userId)
    } catch (error) {
      throw new Error('Error handling image on S3')
    }
  }

  const newWishlistItemData: NewWishlistItem = {
    name,
    price: price ?? null,
    description: description ?? undefined,
    link: sanitizedLink ?? undefined,
    priority,
    is_active: isActive,
    image: imageUrl ?? null,
    user_id: userId,
  }

  if (imageUrl) {
    newWishlistItemData.image = imageUrl
  }

  try {
    const newWishlistItem: Partial<WishlistItem> | undefined = await db
      .insertInto('wishlist_item')
      .values(newWishlistItemData)
      .returning([
        'id',
        'name',
        'description',
        'price',
        'link',
        'image',
        'priority',
        'user_id',
        'is_active',
      ])
      .executeTakeFirst()

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

export const listWishlistItems = async (
  user_id?: string
): Promise<WishlistItem[]> => {
  let userId

  if (!user_id) {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      throw new Error('Unable to get session')
    }

    userId = session.user.id
  } else {
    userId = user_id
  }

  try {
    const wishlistItems = await db
      .selectFrom('wishlist_item')
      .selectAll()
      .where('user_id', '=', userId)
      .orderBy('is_active', 'asc')
      .orderBy(
        sql`
                CASE 
                WHEN priority = 'alta' THEN 1
                WHEN priority = 'normal' THEN 2
                WHEN priority = 'baixa' THEN 3
                END
                `,
        'desc'
      )
      .execute()

    return wishlistItems
  } catch (error) {
    console.error('Database Error:', error)
    throw new Error('Failed to fetch Wishlist items.')
  }
}

export const editWishlistItem = async (
  formData: EditWishlistItemFormDataType,
  wishlistItemId: string,
  userId: string
) => {
  const { name, description, price, link, image, priority, isActive } = formData
  const sanitizedLink = sanitizeLinkUrl(link)
  let imageUrl: string | null = null
  const newImage = image?.[0]

  if (newImage) {
    try {
      imageUrl = await uploadImageToS3(newImage, userId)

      const existingItem = await db
        .selectFrom('wishlist_item')
        .select(['image'])
        .where('id', '=', wishlistItemId)
        .where('user_id', '=', userId)
        .executeTakeFirst()

      if (existingItem?.image) {
        await deleteImageFromS3(existingItem.image)
      }
    } catch (error) {
      throw new Error('Error handling images on S3')
    }
  }

  const editedWishlistItemData: UpdateWishlistItem = {
    name,
    price: price ?? null,
    description: description ?? null,
    link: sanitizedLink ?? null,
    priority,
    is_active: isActive,
  }

  if (imageUrl) {
    editedWishlistItemData.image = imageUrl
  }

  try {
    const editedWishlistItem = await db
      .updateTable('wishlist_item')
      .set(editedWishlistItemData)
      .where('id', '=', wishlistItemId)
      .returning([
        'id',
        'name',
        'description',
        'price',
        'link',
        'image',
        'priority',
        'user_id',
        'is_active',
      ])
      .executeTakeFirst()

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
    const deletedWishlistItem = await db
      .deleteFrom('wishlist_item')
      .where('id', '=', wishlistItemId)
      .returning(['image'])
      .executeTakeFirst()

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

export const purchaseWishlistItem = async (
  wishlistItem: WishlistItem,
  isPurchased: boolean
) => {
  if (!wishlistItem.id) throw new Error('Wishlist item ID is required')

  const purchasedAt = wishlistItem.purchased_at
    ? new Date(wishlistItem.purchased_at)
    : null

  try {
    let query = db
      .updateTable('wishlist_item')
      .set({
        is_purchased: isPurchased,
        purchased_at: isPurchased ? new Date() : null,
      })
      .where('id', '=', wishlistItem.id)

    if (purchasedAt === null) {
      query = query.where('purchased_at', 'is', null)
    } else {
      query = query.where('purchased_at', '=', purchasedAt)
    }

    const updatedWishlistItem = await query.returningAll().executeTakeFirst()

    if (!updatedWishlistItem)
      throw new Error(
        'Error updating wishlist item: possible conflict or item not found.'
      )

    return updatedWishlistItem
  } catch (error) {
    console.error('Error patching wishlist item =>', error)
  }
}
