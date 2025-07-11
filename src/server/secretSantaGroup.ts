'use server'
import { prisma } from '@/lib/prisma'
import { secretSantaGroupFormData } from '@/types/secretSantaGroup'

export const createSecretSantaGroup = async (
  formData: secretSantaGroupFormData,
  userId: string
) => {
  const { name, priceLimit, drawDate } = formData
  try {
    if (!userId) {
      throw new Error('User ID is required to create a Secret Santa group.')
    }

    const newSecretSantaGroup = await prisma.secretSantaGroup.create({
      data: {
        name,
        priceLimit: priceLimit ?? null,
        drawDate: drawDate ? new Date(drawDate) : null,
        userId,
      },
    })

    return newSecretSantaGroup
  } catch (error) {
    console.error('Error creating Secret Santa group =>', error)
    return null
  }
}
