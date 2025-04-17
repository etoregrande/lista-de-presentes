import { wishlistItemFormSchema } from '@/schemas/wishlistItem'
import { z } from 'zod'

export type WishlistItemFormDataType = z.infer<typeof wishlistItemFormSchema>
