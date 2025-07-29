import { z } from 'zod'

export const secretSantaGroupSchema = z.object({
  name: z
    .string()
    .min(3, 'Mínimo de 3 caracteres')
    .transform(
      (name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    ),
  priceLimit: z
    .number()
    .int()
    .min(0, 'O preço não pode ser negativo')
    .nullish(),
  drawDate: z.date().nullish(),
})

export const secretSantaGroupFormSchema = secretSantaGroupSchema
