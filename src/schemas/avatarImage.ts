import { z } from 'zod'
import { imageFileSchema } from './image'

export const avatarImageFormSchema = z.object({
  image: imageFileSchema.nullish(),
})
