'use server'

import { prisma } from '@/lib/prisma'
import { identifierSchema } from '@/schemas/common'
import { requireAuthenticatedUserId } from './session'

export async function followUser(input: string) {
  const followerId = await requireAuthenticatedUserId()
  const followedId = identifierSchema.parse(input)
  if (followerId === followedId) throw new Error('Cannot follow yourself')

  const user = await prisma.user.findUnique({
    where: { id: followedId },
    select: { id: true },
  })
  if (!user) throw new Error('User not found')

  await prisma.userFollow.upsert({
    where: { followerId_followedId: { followerId, followedId } },
    create: { followerId, followedId },
    update: {},
  })
}

export async function unfollowUser(input: string) {
  const followerId = await requireAuthenticatedUserId()
  const followedId = identifierSchema.parse(input)

  await prisma.userFollow.deleteMany({ where: { followerId, followedId } })
}
