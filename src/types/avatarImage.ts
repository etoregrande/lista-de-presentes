import { avatarImageFormSchema } from '@/schemas/avatarImage'
import { z } from 'zod'

export type AvatarImageFormData = z.infer<typeof avatarImageFormSchema>
