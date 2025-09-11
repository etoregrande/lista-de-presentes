import { wishlistItemFormSchema } from '@/schemas/wishlistItem'
import { z } from 'zod'

export type WishlistItemFormData = z.infer<typeof wishlistItemFormSchema>
