import z from 'zod'

export const avatarImageFormSchema = z.object({
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
})
