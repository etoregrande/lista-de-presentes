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

export const signUpFormSchema = z.object({
  name: z
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
    ),
  email: z.string().email({ message: 'Email inválido' }).toLowerCase().trim(),
  password: z.string().min(8, { message: 'Mínimo de 8 caracteres' }),
})

export const signInFormSchema = signUpFormSchema.omit({ name: true })
export const forgotPasswordFormSchema = signUpFormSchema.omit({
  name: true,
  password: true,
})
export const resetPasswordFormSchema = signUpFormSchema.omit({
  name: true,
  email: true,
})
