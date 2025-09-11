'use server'

import { prisma } from '@/lib/prisma'
import { AvatarImageFormData } from '@/types/avatarImage'
import { uploadImageToS3 } from './s3'

export const updateUserAvatar = async (
  formData: AvatarImageFormData,
  userId: string
) => {
  const { image } = formData

  if (!image) {
    throw new Error('No image provided')
  }

  try {
    const imageUrl = await uploadImageToS3(image, 'user avatar', userId)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
    })

    if (!updatedUser) {
      throw new Error('Error updating user avatar')
    }

    return updatedUser
  } catch (error) {
    throw new Error(`Error updating user avatar: ${error}`)
  }
}
