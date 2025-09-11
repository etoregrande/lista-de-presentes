'use server'
import { prisma } from '@/lib/prisma'

export async function getUserById(userId?: string) {
  if (!userId) throw new Error('You must provide a userId')

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  return user
}

export async function getUserByEmail(email?: string) {
  if (!email) throw new Error('You must provide a email')

  const user = await prisma.user.findUnique({
    where: { email },
  })

  return user
}
