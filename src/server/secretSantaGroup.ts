'use server'

import { PrismaClientKnownRequestError } from '@/generated/prisma/runtime/library'
import { prisma } from '@/lib/prisma'
import { secretSantaGroupFormData } from '@/types/secretSantaGroup'

type FieldError = {
  field: keyof secretSantaGroupFormData | 'root'
  message: string
}

export const listSecretSantaGroups = async (userId: string) => {
  if (!userId) {
    throw new Error('User ID is required to list Secret Santa groups')
  }
  const secretSantaGroups = await prisma.userSecretSantaGroup.findMany({
    where: { userId },
    orderBy: { secretSantaGroup: { name: 'asc' } },
    include: {
      secretSantaGroup: true,
    },
  })

  return secretSantaGroups.map((group) => group.secretSantaGroup)
}

export const getSecretSantaGroup = async (groupId: string) => {
  if (!groupId) {
    throw new Error('Group ID is required to get a Secret Santa group')
  }
  const secretSantaGroup = await prisma.secretSantaGroup.findUnique({
    where: { id: groupId },
  })

  if (!secretSantaGroup) {
    throw new Error('Secret Santa group not found')
  }

  return secretSantaGroup
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
        ownerId: userId,
      },
    })

    if (newSecretSantaGroup) {
      await prisma.userSecretSantaGroup.create({
        data: {
          userId,
          secretSantaGroupId: newSecretSantaGroup.id,
        },
      })
    }

    return { success: true, group: newSecretSantaGroup }
  } catch (error: PrismaClientKnownRequestError | unknown) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return {
        success: false,
        error: {
          field: 'name',
          message: 'Já existe um grupo com este nome',
        } satisfies FieldError,
      }
    }

    return {
      success: false,
      error: {
        field: 'root',
        message: 'Erro ao criar o grupo',
      } satisfies FieldError,
    }
  }
}

export const listSecretSantaGroupParticipants = async (groupId: string) => {
  if (!groupId) {
    throw new Error('Group ID is required to list participants')
  }

  try {
    const participants = await prisma.user.findMany({
      where: {
        secretSantaGroupParticipants: {
          some: { secretSantaGroupId: groupId },
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
        email: true,
      },
    })

    return participants
  } catch (error) {
    console.error('Error listing participants:', error)
    throw new Error('Failed to list participants')
  }
}
