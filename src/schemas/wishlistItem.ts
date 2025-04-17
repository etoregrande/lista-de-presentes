import { z } from 'zod'

export const wishlistItemSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .transform(
      (name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    ),
  description: z.string().nullable(),
  price: z.number().int().min(0, 'O preço não pode ser negativo').nullish(),
  image: z
    .any()
    .refine(
      (file) => {
        if (typeof file === 'string') return true
        if (!file) return true // Permite se não houver arquivo
        return file.size <= 5 * 1024 * 1024 // 5MB
      },
      { message: 'A imagem deve ter no máximo 5MB.' }
    )
    .refine(
      (file) => {
        if (typeof file === 'string') return true
        if (!file) return true // Permite se não houver arquivo
        return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
      },
      { message: 'Formato inválido. Use JPG, PNG ou WEBP.' }
    )
    .nullable(),
  link: z
    .string()
    .transform((val) => {
      if (!val) return val
      return val.startsWith('http://') || val.startsWith('https://')
        ? val
        : `https://${val}`
    })
    .nullable(),
  priority: z
    .string()
    .refine((value) => ['alta', 'normal', 'baixa'].includes(value), {
      message: 'Prioridade deve ser "alta", "normal", or "baixa"',
    })
    .default('normal')
    .optional(),
  isPurchased: z.boolean().optional(),
  purchasedAt: z.date().optional(),
  isActive: z.boolean().optional(),
})

export const wishlistItemFormSchema = wishlistItemSchema.omit({
  isPurchased: true,
  purchasedAt: true,
})
