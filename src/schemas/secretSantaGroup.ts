import { z } from 'zod'

export const secretSantaGroupSchema = z.object({
  name: z
    .string()
    .min(3, 'Mínimo de 3 caracteres')
    .transform(
      (name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    ),
  priceLimit: z
    .number({
      invalid_type_error: 'O preço deve ser um número',
    })
    .int()
    .min(0, 'O preço não pode ser negativo')
    .nullish(),
  eventDate: z
    .date({
      invalid_type_error: 'Data inválida',
    })
    .nullish(),
})

export const secretSantaGroupFormSchema = secretSantaGroupSchema
