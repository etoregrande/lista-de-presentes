'use server'

import { prisma } from '@/lib/prisma'
import { secretSantaGroupFormData } from '@/types/secretSantaGroup'
import { Field } from 'react-hook-form'

type FieldError = {
  field: keyof secretSantaGroupFormData | 'root'
  message: string
}

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

    return { success: true, group: newSecretSantaGroup }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return {
        success: false,
        error: {
          field: 'name',
          message: 'Já existe um grupo com este nome',
        } satisfies FieldError,
      }
    }

    // console.error('Erro ao criar grupo =>', error)
    return {
      success: false,
      error: {
        field: 'root',
        message: 'Erro ao criar o grupo',
      } satisfies FieldError,
    }
  }
}
