'use server'

import { prisma } from '@/lib/prisma'

export async function getPublicUserProfile(userId: string) {
  if (typeof userId !== 'string' || !userId.trim()) {
    throw new Error('User ID is required')
  }
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, image: true },
  })
}
