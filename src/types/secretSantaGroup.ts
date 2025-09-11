import { secretSantaGroupFormSchema } from '@/schemas/secretSantaGroup'
import { z } from 'zod'

export type secretSantaGroupFormData = z.infer<
  typeof secretSantaGroupFormSchema
>
