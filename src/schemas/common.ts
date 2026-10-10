import { z } from 'zod'

export const MAX_DATABASE_INTEGER = 2_147_483_647
export const priceInCentsSchema = z
  .number({ error: 'O preço deve ser um número' })
  .int('Informe um valor inteiro em centavos')
  .min(0, 'O preço não pode ser negativo')
  .max(MAX_DATABASE_INTEGER, 'Preço muito alto')
export const identifierSchema = z
  .string()
  .min(1)
  .max(512)
  .refine(
    (value) => value.trim() === value && value.length > 0,
    'Identificador inválido'
  )
