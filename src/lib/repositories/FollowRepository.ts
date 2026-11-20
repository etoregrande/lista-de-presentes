import { prisma } from '@/lib/prisma'

export type FollowedUser = {
  id: string
  name: string
  image: string | null
}

export async function listFollowedUsers(
  followerId: string
): Promise<FollowedUser[]> {
  const follows = await prisma.userFollow.findMany({
    where: { followerId },
    orderBy: [{ createdAt: 'desc' }, { followedId: 'asc' }],
    select: {
      followed: { select: { id: true, name: true, image: true } },
    },
  })

  return follows.map(({ followed }) => followed)
}

export async function isFollowingUser(followerId: string, followedId: string) {
  return Boolean(
    await prisma.userFollow.findUnique({
      where: { followerId_followedId: { followerId, followedId } },
      select: { followerId: true },
    })
  )
}
