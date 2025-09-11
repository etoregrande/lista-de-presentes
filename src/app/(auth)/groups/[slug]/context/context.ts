'use client'

import { createContext, Dispatch, SetStateAction, useContext } from 'react'
import { SecretSantaGroup, User } from '@/generated/prisma'

interface SecretSantaGroupsContextType {
  secretSantaGroup: SecretSantaGroup
  participants: Partial<User>[]
  setParticipants: Dispatch<SetStateAction<Partial<User>[]>>
  isOwner: boolean
}

export const SecretSantaGroupContext =
  createContext<SecretSantaGroupsContextType | null>(null)

export function useSecretSantaGroup() {
  const context = useContext(SecretSantaGroupContext)
  if (!context) {
    throw new Error(
      'useSecretSantaGroup must be used within a SecretSantaGroupProvider'
    )
  }
  return context
}
