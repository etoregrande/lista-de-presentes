import { prisma } from '@/lib/prisma'

export const getSecretSantaReceiver = async (
  giverId: string,
  groupId: string
) => {
  if (!giverId || !groupId) {
    throw new Error(
      'Giver ID and Group ID are required to get secret santa receiver'
    )
  }
  try {
    const result = await prisma.secretSantaDraw.findFirst({
      where: {
        giverId,
        groupId,
      },
      select: {
        receiver: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    if (!result) return null
    return result.receiver
  } catch (error) {
    console.error('Error fetching giver:', error)
    throw new Error('Failed to fetch giver')
  }
}

// DEV ONLY - listSecretSantaReceivers
export const listSecretSantaReceivers = async (groupId: string) => {
  if (!groupId) {
    throw new Error('Group ID is required to list group receivers')
  }

  try {
    const result = await prisma.secretSantaDraw.findMany({
      where: { groupId },
      select: {
        giver: {
          select: {
            name: true,
          },
        },
        receiver: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!result) return null
    return result
  } catch (error) {
    console.error('Error listing receivers:', error)
    throw new Error('Failed to list receivers')
  }
}
