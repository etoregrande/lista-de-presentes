import { z } from 'zod'
import { priceInCentsSchema } from './common'

export const secretSantaGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .max(255, 'Máximo de 255 caracteres')
    .min(3, 'Mínimo de 3 caracteres')
    .transform(
      (name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    )
    .refine((name) => name.length <= 255, 'Máximo de 255 caracteres'),
  priceLimit: priceInCentsSchema.nullish(),
  eventDate: z
    .date({
      error: 'Data inválida',
    })
    .nullish(),
})

export const secretSantaGroupFormSchema = secretSantaGroupSchema
