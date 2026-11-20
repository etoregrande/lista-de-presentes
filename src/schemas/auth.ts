import { z } from 'zod'

const lowercaseWords = [
  'da',
  'de',
  'do',
  'das',
  'dos',
  'e',
  'a',
  'o',
  'as',
  'os',
  'na',
  'no',
  'nas',
  'nos',
]

export const nameSchema = z
    .string()
    .min(2, { message: 'Informe nome e sobrenome' })
    .max(100, { message: 'Nome muito grande' })
    .trim()
    .regex(/^[A-Za-zÀ-ÿ\s'-]+$/, { message: 'Nome inválido' })
    .refine((val) => val.split(/\s+/).length >= 2, {
      message: 'Informe nome e sobrenome',
    })
    .transform((name) =>
      name
        .toLowerCase()
        .split(/\s+/)
        .map((word, index) =>
          index > 0 && lowercaseWords.includes(word)
            ? word
            : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(' ')
    )

export const signInFormSchema = z.object({
  email: z.email({ message: 'Email inválido' }).toLowerCase().trim(),
})

export const otpFormSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'Informe o código de seis dígitos'),
})

export const completeProfileSchema = z.object({ name: nameSchema })
