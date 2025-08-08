'use server'

import { PrismaClientKnownRequestError } from '@/generated/prisma/runtime/library'
import { prisma } from '@/lib/prisma'
import { drawSecretSanta, generateSecretSantaGroupSlug } from '@/lib/utils'
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

export const getSecretSantaGroup = async (slug: string) => {
  if (!slug) {
    throw new Error('Group Slug is required to get a Secret Santa group')
  }
  const secretSantaGroup = await prisma.secretSantaGroup.findUnique({
    where: { slug },
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

    const slug = generateSecretSantaGroupSlug(name)
    const newSecretSantaGroup = await prisma.secretSantaGroup.create({
      data: {
        name,
        priceLimit: priceLimit ?? null,
        estimateDrawDate: drawDate ? new Date(drawDate) : null,
        ownerId: userId,
        slug,
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

export const deleteSecretSantaGroup = async (
  userId: string,
  groupId: string
) => {
  if (!groupId || !userId) {
    throw new Error('Group ID and User ID are required to delete a group')
  }

  try {
    const deletedGroup = await prisma.secretSantaGroup.delete({
      where: {
        id: groupId,
        ownerId: userId,
      },
    })

    console.log('Deleted group:', deletedGroup)
    if (!deletedGroup) {
      return { success: false, error: 'Group not found or not owned by user' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting Secret Santa group:', error)
    return { success: false, error: 'Failed to delete group' }
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

export const isSecretSantaGroupParticipant = async (
  slug: string,
  userId: string
): Promise<boolean> => {
  if (!slug || !userId) {
    throw new Error('Slug and User ID are required')
  }

  const participant = await prisma.userSecretSantaGroup.findFirst({
    where: {
      userId,
      secretSantaGroup: {
        slug,
      },
    },
  })

  return !!participant
}

export const createSecretSantaGroupParticipant = async (
  userId: string,
  groupId: string
) => {
  if (!userId || !groupId) {
    throw new Error('User ID and Group ID are required to join a group')
  }

  try {
    const joinedGroup = await prisma.userSecretSantaGroup.create({
      data: {
        userId,
        secretSantaGroupId: groupId,
      },
      include: {
        secretSantaGroup: true,
      },
    })

    return { success: true, secretSantaGroup: joinedGroup.secretSantaGroup }
  } catch (error) {
    console.error('Error creating participant:', error)
    throw new Error('Failed to join secret santa group')
  }
}

export const deleteSecretSantaGroupParticipant = async (
  userId: string,
  groupId: string
) => {
  if (!userId || !groupId) {
    throw new Error('User ID and Group ID are required to join a group')
  }

  try {
    const leftGroup = await prisma.userSecretSantaGroup.delete({
      where: {
        userId_secretSantaGroupId: {
          userId,
          secretSantaGroupId: groupId,
        },
      },
      select: {
        secretSantaGroupId: true,
      },
    })

    return { success: true, groupId: leftGroup.secretSantaGroupId }
  } catch (error) {
    console.error('Error deleting participant group:', error)
    throw new Error('Failed to join secret santa group')
  }
}

export const createSecretSantaGroupDraw = async (groupId: string) => {
  if (!groupId) {
    throw new Error('Group ID is required to hold the secret santa draw')
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
      },
    })

    const drawResult = drawSecretSanta(participants)

    if (!drawResult) {
      return {
        success: false,
        error: 'At least 4 participants are needed to hold a draw',
      }
    }

    const draw = drawResult.map((d) => {
      if (!d.giverId || !d.receiverId) {
        throw new Error('Draw result must have both giverId and receiverId')
      }
      return {
        ...d,
        groupId,
        giverId: d.giverId,
        receiverId: d.receiverId,
      }
    })

    const createDraw = await prisma.secretSantaDraw.createMany({
      data: [...draw],
    })

    return { success: true, draw: createDraw }
  } catch (error) {
    console.error('Error holding secret santa draw:', error)
    return { success: false, error: 'Failed to hold secret santa draw' }
  }
}
