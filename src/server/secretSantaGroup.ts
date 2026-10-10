'use server'

import { isPrismaP2002 } from '@/lib/error'
import { prisma } from '@/lib/prisma'
import { drawSecretSanta, generateSecretSantaGroupSlug } from '@/lib/utils'
import { secretSantaGroupFormData } from '@/types/secretSantaGroup'
import { requireAuthenticatedUserId } from './session'

type FieldError = {
  field: keyof secretSantaGroupFormData | 'root'
  message: string
}

async function requireGroupOwner(groupId: string) {
  const userId = await requireAuthenticatedUserId()
  if (!groupId) throw new Error('Group ID is required')
  const group = await prisma.secretSantaGroup.findUnique({
    where: { id: groupId, ownerId: userId },
  })
  if (!group) throw new Error('Group not found or access denied')
  return { userId, group }
}

async function requireGroupParticipant(groupId: string) {
  const userId = await requireAuthenticatedUserId()
  if (!groupId) throw new Error('Group ID is required')
  const membership = await prisma.userSecretSantaGroup.findUnique({
    where: {
      userId_secretSantaGroupId: { userId, secretSantaGroupId: groupId },
    },
  })
  if (!membership) throw new Error('Group not found or access denied')
  return userId
}

export const listSecretSantaGroups = async () => {
  const userId = await requireAuthenticatedUserId()
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
  const userId = await requireAuthenticatedUserId()
  if (!slug) {
    throw new Error('Group Slug is required to get a Secret Santa group')
  }
  const secretSantaGroup = await prisma.secretSantaGroup.findUnique({
    where: {
      slug,
      OR: [{ ownerId: userId }, { participants: { some: { userId } } }],
    },
  })

  if (!secretSantaGroup) {
    throw new Error('Group not found or access denied')
  }
  return secretSantaGroup
}

export const getSecretSantaGroupInvitation = async (slug: string) => {
  await requireAuthenticatedUserId()
  if (!slug) throw new Error('Group Slug is required')
  const group = await prisma.secretSantaGroup.findUnique({
    where: { slug },
    select: { name: true, image: true, isDrawn: true },
  })
  if (!group) throw new Error('Group not found')
  return group
}

export const createSecretSantaGroup = async (
  formData: secretSantaGroupFormData
) => {
  const userId = await requireAuthenticatedUserId()
  const { name, priceLimit, eventDate } = formData
  try {
    const slug = generateSecretSantaGroupSlug(name)
    const newSecretSantaGroup = await prisma.secretSantaGroup.create({
      data: {
        name,
        priceLimit: priceLimit ?? null,
        eventDate: eventDate ? new Date(eventDate) : null,
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
  } catch (error) {
    if (isPrismaP2002(error)) {
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

export const updateSecretSantaGroup = async (
  groupId: string,
  formData: secretSantaGroupFormData
) => {
  const { userId: ownerId } = await requireGroupOwner(groupId)

  const { name, eventDate, priceLimit } = formData

  try {
    const updatedGroup = await prisma.secretSantaGroup.update({
      where: {
        id: groupId,
        ownerId: ownerId,
      },
      data: {
        name,
        priceLimit,
        eventDate,
      },
    })

    if (!updatedGroup) {
      return { success: false, error: 'Group not found or not owned by user' }
    }

    return { success: true, group: updatedGroup }
  } catch (error) {
    console.error(error)
    throw new Error('Failed to update group')
  }
}

export const deleteSecretSantaGroup = async (groupId: string) => {
  const { userId } = await requireGroupOwner(groupId)

  try {
    const deletedGroup = await prisma.secretSantaGroup.delete({
      where: {
        id: groupId,
        ownerId: userId,
      },
    })

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
  await requireGroupParticipant(groupId)

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
  slug: string
): Promise<boolean> => {
  const userId = await requireAuthenticatedUserId()
  if (!slug) throw new Error('Slug is required')

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

export const createSecretSantaGroupParticipant = async (slug: string) => {
  const userId = await requireAuthenticatedUserId()
  if (!slug) throw new Error('Group Slug is required')
  const group = await prisma.secretSantaGroup.findUnique({
    where: { slug },
    select: { id: true },
  })
  if (!group) throw new Error('Group not found')
  const groupId = group.id

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

export const leaveSecretSantaGroup = async (groupId: string) => {
  const userId = await requireGroupParticipant(groupId)
  const group = await prisma.secretSantaGroup.findUnique({
    where: { id: groupId },
    select: { ownerId: true },
  })
  if (!group || group.ownerId === userId)
    throw new Error('The owner must delete the group instead of leaving it')
  return deleteParticipantMembership(userId, groupId)
}

export const removeSecretSantaGroupParticipant = async (
  groupId: string,
  participantId: string
) => {
  const { group } = await requireGroupOwner(groupId)
  if (!participantId || participantId === group.ownerId)
    throw new Error('Invalid participant removal')
  return deleteParticipantMembership(participantId, groupId)
}

async function deleteParticipantMembership(userId: string, groupId: string) {
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
  const { userId } = await requireGroupOwner(groupId)

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

    const SecretSantaDrawResult = drawSecretSanta(participants)

    if (!SecretSantaDrawResult) {
      return {
        success: false,
        error: 'At least 4 participants are needed to hold a draw',
      }
    }

    const draw = SecretSantaDrawResult.map((d) => {
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

    const [createDraw, updateGroup] = await prisma.$transaction([
      prisma.secretSantaDraw.createMany({
        data: [...draw],
      }),
      prisma.secretSantaGroup.update({
        where: { id: groupId, ownerId: userId },
        data: { drawDate: new Date(), isDrawn: true },
      }),
    ])

    return { success: true, draw: createDraw, group: updateGroup }
  } catch (error) {
    console.error('Error holding secret santa draw:', error)
    return { success: false, error: 'Failed to hold secret santa draw' }
  }
}
