import { wishlistItemFormSchema } from '@/schemas/wishlistItem'
import { z } from 'zod'
import type { WishlistItem as DatabaseWishlistItem } from '@/generated/prisma'

export type WishlistItemFormData = z.infer<typeof wishlistItemFormSchema>
export type WishlistItem = Omit<DatabaseWishlistItem, 'purchaseClaimHash'>
