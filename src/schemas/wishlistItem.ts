import { isSafeUrl } from '@/lib/utils'
import { z } from 'zod'
import { imageFileSchema } from './image'
import { priceInCentsSchema } from './common'

export const PriorityEnum = z.enum(['alta', 'normal', 'baixa'])
export type Priority = z.infer<typeof PriorityEnum>

export const wishlistItemSchema = z.object({
  name: z
    .string()
    .trim()
    .max(255, 'Máximo de 255 caracteres')
    .min(1, 'Nome é obrigatório')
    .transform(
      (name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    )
    .refine((name) => name.length <= 255, 'Máximo de 255 caracteres'),
  description: z.string().nullable(),
  price: priceInCentsSchema.nullish(),
  image: imageFileSchema.nullish(),
  link: z
    .string()
    .trim()
    .transform((val) => {
      if (!val) return val
      return val.startsWith('http://') || val.startsWith('https://')
        ? val
        : `https://${val}`
    })
    .refine((val) => !val || isSafeUrl(val), {
      message: 'URL inválida ou não permitida',
    })
    .nullable(),
  priority: PriorityEnum.default('normal').optional(),
  isPurchased: z.boolean().optional(),
  purchasedAt: z.date().optional(),
  isActive: z.boolean().optional(),
})

export const wishlistItemFormSchema = wishlistItemSchema.omit({
  isPurchased: true,
  purchasedAt: true,
})
